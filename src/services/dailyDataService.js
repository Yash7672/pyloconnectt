import { supabase } from '../lib/supabase';
import { getTodayDateKey } from '../utils/dateUtils';

// Fetch the authenticated user's CURRENT DAY daily_data row from Supabase.
// Security relies on Supabase RLS (auth.uid() = user_id). The authenticated
// session is the only way to reach the user's own row.
//
// Compatibility note: the Flutter app serializes
//   tasks    -> array of task objects
//   lists    -> array of checklist objects
//   sublists -> flat array of checklist items with a `source` field
// We return the parsed raw arrays unchanged.
export async function getTodayDailyData() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: new Error('Not authenticated') };
  }

  const todayKey = getTodayDateKey();

  const { data, error } = await supabase
    .from('daily_data')
    .select('tasks, lists, sublists, updated_at')
    .eq('user_id', user.id)
    .eq('data_date', todayKey)
    .maybeSingle();

  if (error) {
    return { error };
  }

  if (!data) {
    return { data: { tasks: [], lists: [], sublists: [] }, error: null };
  }

  return {
    data: {
      tasks: safeParseArray(data.tasks),
      lists: safeParseArray(data.lists),
      sublists: safeParseArray(data.sublists),
      updatedAt: data.updated_at,
    },
    error: null,
  };
}

// ── Concurrency-safe tick/untick ───────────────────────────────────────
//
// Instead of writing the locally-held (possibly stale) full array back to
// the database, each function:
//   1. Fetches the latest column value directly from Supabase.
//   2. Finds the specific target item in that fresh snapshot.
//   3. Flips ONLY that item's completion flag.
//   4. Writes back the updated single column.
//
// This avoids the race where a stale local state accidentally overwrites a
// newer change made from the Flutter app (or another browser tab).

// Toggle a single task's `isCompleted` flag. Returns the freshest parsed
// arrays for the caller to reconcile its React state with (merge), or to
// use for a rollback on failure.
export async function saveTaskCompletion(taskId, completed) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const todayKey = getTodayDateKey();

  const { data, error: fetchErr } = await supabase
    .from('daily_data')
    .select('tasks, lists, sublists')
    .eq('user_id', user.id)
    .eq('data_date', todayKey)
    .maybeSingle();
  if (fetchErr) throw fetchErr;

  const tasks = safeParseArray(data?.tasks);
  const lists = safeParseArray(data?.lists);
  const sublists = safeParseArray(data?.sublists);

  const target = tasks.find((t) => t.id === taskId);
  if (!target) {
    return { tasks, lists, sublists };
  }
  if (target.isCompleted === completed) {
    return { tasks, lists, sublists };
  }

  const nextTasks = tasks.map((t) =>
    t.id === taskId
      ? {
          ...t,
          isCompleted: completed,
          completedAt: completed
            ? (t.completedAt ?? Date.now())
            : null,
        }
      : t,
  );

  const { error: updateErr } = await supabase
    .from('daily_data')
    .update({ tasks: nextTasks, updated_at: new Date().toISOString() })
    .eq('user_id', user.id)
    .eq('data_date', todayKey);
  if (updateErr) throw updateErr;

  return { tasks: nextTasks, lists, sublists };
}

// Toggle a single embedded-task checklist item. Flutter serializes checklist
// items TWICE for the same logical item:
//   tasks[i].checklist[j]  -> { text, done }               (embedded in task)
//   sublists[n]            -> { id: "<taskId>:<j>", source: 'task',
//                              parentId: taskId, completed, ... }
// To keep both representations consistent (so the next Flutter pull merges the
// right completion state, and the embedded counter stays accurate), we flip
// `done` in the task AND `completed` in the matching sublist entry together.
// Same fresh-fetch strategy as [saveTaskCompletion].
export async function saveTaskChecklistCompletion(
  taskId,
  checklistIndex,
  done,
) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const todayKey = getTodayDateKey();

  const { data, error: fetchErr } = await supabase
    .from('daily_data')
    .select('tasks, lists, sublists')
    .eq('user_id', user.id)
    .eq('data_date', todayKey)
    .maybeSingle();
  if (fetchErr) throw fetchErr;

  const tasks = safeParseArray(data?.tasks);
  const lists = safeParseArray(data?.lists);
  const sublists = safeParseArray(data?.sublists);

  const target = tasks.find((t) => t.id === taskId);
  if (
    !target ||
    !Array.isArray(target.checklist) ||
    !target.checklist[checklistIndex]
  ) {
    return { tasks, lists, sublists };
  }
  if (target.checklist[checklistIndex].done === done) {
    return { tasks, lists, sublists };
  }

  const entryId = `${taskId}:${checklistIndex}`;

  const nextTasks = tasks.map((t) =>
    t.id === taskId
      ? {
          ...t,
          checklist: (t.checklist || []).map((item, i) =>
            i === checklistIndex ? { ...item, done } : item,
          ),
        }
      : t,
  );

  const nextSublists = sublists.map((s) =>
    s.id === entryId && s.source === 'task' && s.parentId === taskId
      ? { ...s, completed: done }
      : s,
  );

  const { error: updateErr } = await supabase
    .from('daily_data')
    .update({
      tasks: nextTasks,
      sublists: nextSublists,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', user.id)
    .eq('data_date', todayKey);
  if (updateErr) throw updateErr;

  return { tasks: nextTasks, lists, sublists: nextSublists };
}

// Toggle a single sublist item's `completed` flag. Same fresh-fetch strategy
// as [saveTaskCompletion].
export async function saveSublistCompletion(sublistId, completed) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const todayKey = getTodayDateKey();

  const { data, error: fetchErr } = await supabase
    .from('daily_data')
    .select('tasks, lists, sublists')
    .eq('user_id', user.id)
    .eq('data_date', todayKey)
    .maybeSingle();
  if (fetchErr) throw fetchErr;

  const tasks = safeParseArray(data?.tasks);
  const lists = safeParseArray(data?.lists);
  const sublists = safeParseArray(data?.sublists);

  const target = sublists.find((s) => s.id === sublistId);
  if (!target) {
    return { tasks, lists, sublists };
  }
  if (target.completed === completed) {
    return { tasks, lists, sublists };
  }

  const nextSublists = sublists.map((s) =>
    s.id === sublistId ? { ...s, completed } : s,
  );

  const { error: updateErr } = await supabase
    .from('daily_data')
    .update({ sublists: nextSublists, updated_at: new Date().toISOString() })
    .eq('user_id', user.id)
    .eq('data_date', todayKey);
  if (updateErr) throw updateErr;

  return { tasks, lists, sublists: nextSublists };
}

// Guard against malformed JSONB coming back as a string or a non-array.
function safeParseArray(value) {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      if (!Array.isArray(parsed)) {
        console.warn('PYLO Web: expected JSONB array, got', typeof parsed, value.slice(0, 200));
        return [];
      }
      return parsed;
    } catch {
      console.warn('PYLO Web: malformed JSONB array field', value.slice(0, 200));
      return [];
    }
  }
  return [];
}