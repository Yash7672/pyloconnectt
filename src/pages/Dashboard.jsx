import { useState, useEffect, useCallback, useRef } from 'react';
import Navbar from '../components/Navbar';
import TaskSection from '../components/TaskSection';
import ListSection from '../components/ListSection';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import {
  getTodayDailyData,
  saveTaskCompletion,
  saveTaskChecklistCompletion,
  saveSublistCompletion,
} from '../services/dailyDataService';

export default function Dashboard({ session }) {
  const email = session?.user?.email || '';

  const [tasks, setTasks] = useState([]);
  const [lists, setLists] = useState([]);
  const [sublists, setSublists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toggleError, setToggleError] = useState('');
  const [savingItems, setSavingItems] = useState(new Set());
  const [expandedListId, setExpandedListId] = useState(null);

  // Synchronous guard against duplicate clicks on the same item. A ref is
  // used because React state updates are async and can't stop a second
  // click in the same frame from starting another save.
  const savingRef = useRef(new Set());

  const beginSave = useCallback((id) => {
    if (savingRef.current.has(id)) return false;
    savingRef.current.add(id);
    setSavingItems(new Set(savingRef.current));
    return true;
  }, []);

  const endSave = useCallback((id) => {
    savingRef.current.delete(id);
    setSavingItems(new Set(savingRef.current));
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data, error: fetchError } = await getTodayDailyData();
      if (fetchError) throw fetchError;
      setTasks(data.tasks || []);
      setLists(data.lists || []);
      setSublists(data.sublists || []);
    } catch (err) {
      console.error('PYLO Web: dashboard fetch failed', err);
      setError(
        'Unable to load today\'s data. Please check your connection and try again.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const showError = useCallback((msg) => {
    setToggleError(msg);
    setTimeout(() => setToggleError(''), 3500);
  }, []);

  // Toggle a task's isCompleted. The service refetches the latest row before
  // flipping ONLY this task's flag, so a newer state (e.g. changed by the
  // Flutter app in another moment) is never clobbered. On success the fresh
  // arrays replace state; on failure the previous snapshot is restored.
  const handleToggleTask = useCallback(async (taskId) => {
    if (!beginSave(taskId)) return;

    const previousTasks = tasks;
    const target = previousTasks.find((t) => t.id === taskId);
    if (!target) {
      endSave(taskId);
      return;
    }
    const nextCompleted = !target.isCompleted;

    // Optimistic update
    setTasks(
      previousTasks.map((t) =>
        t.id === taskId ? { ...t, isCompleted: nextCompleted } : t,
      ),
    );

    try {
      const fresh = await saveTaskCompletion(taskId, nextCompleted);
      setTasks(fresh.tasks);
      setLists(fresh.lists);
      setSublists(fresh.sublists);
    } catch (err) {
      console.error('PYLO Web: task toggle save failed', err);
      setTasks(previousTasks);
      showError('Failed to update task. Please try again.');
    } finally {
      endSave(taskId);
    }
  }, [tasks, beginSave, endSave, showError]);

  // Toggle a single embedded-task checklist item's `done` flag. Writes both
  // the task's embedded checklist entry and the matching sublist entry to keep
  // the two representations consistent.
  const handleToggleTaskChecklist = useCallback(async (taskId, checklistIndex) => {
    const saveId = `${taskId}:${checklistIndex}`;
    if (!beginSave(saveId)) return;

    const previousTasks = tasks;
    const target = previousTasks.find((t) => t.id === taskId);
    if (
      !target ||
      !Array.isArray(target.checklist) ||
      !target.checklist[checklistIndex]
    ) {
      endSave(saveId);
      return;
    }
    const nextDone = !target.checklist[checklistIndex].done;

    // Optimistic update
    setTasks(
      previousTasks.map((t) =>
        t.id === taskId
          ? {
              ...t,
              checklist: (t.checklist || []).map((item, i) =>
                i === checklistIndex ? { ...item, done: nextDone } : item,
              ),
            }
          : t,
      ),
    );

    try {
      const fresh = await saveTaskChecklistCompletion(
        taskId,
        checklistIndex,
        nextDone,
      );
      setTasks(fresh.tasks);
      setLists(fresh.lists);
      setSublists(fresh.sublists);
    } catch (err) {
      console.error('PYLO Web: task checklist toggle save failed', err);
      setTasks(previousTasks);
      showError('Failed to update checklist item. Please try again.');
    } finally {
      endSave(saveId);
    }
  }, [tasks, beginSave, endSave, showError]);

  // Toggle a sublist item's completed flag. Same fresh-fetch strategy as the
  // task toggle above.
  const handleToggleSublist = useCallback(async (sublistId) => {
    if (!beginSave(sublistId)) return;

    const previousSublists = sublists;
    const target = previousSublists.find((s) => s.id === sublistId);
    if (!target) {
      endSave(sublistId);
      return;
    }
    const nextCompleted = !target.completed;

    // Optimistic update
    setSublists(
      previousSublists.map((s) =>
        s.id === sublistId ? { ...s, completed: nextCompleted } : s,
      ),
    );

    try {
      const fresh = await saveSublistCompletion(sublistId, nextCompleted);
      setTasks(fresh.tasks);
      setLists(fresh.lists);
      setSublists(fresh.sublists);
    } catch (err) {
      console.error('PYLO Web: sublist toggle save failed', err);
      setSublists(previousSublists);
      showError('Failed to update item. Please try again.');
    } finally {
      endSave(sublistId);
    }
  }, [sublists, beginSave, endSave, showError]);

  // Single-open accordion: expanding one list collapses the others. The
  // expanded state is purely UI-local (not synced to Supabase).
  const toggleListExpanded = useCallback((listId) => {
    setExpandedListId((prev) => (prev === listId ? null : listId));
  }, []);

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="dashboard">
      <Navbar email={email} />

      <main className="dashboard__main">
        <div className="dashboard__container">
          <h1 className="dashboard__greeting">
            {greeting}, <span className="dashboard__name">{email.split('@')[0]}</span>
          </h1>
          <p className="dashboard__subtitle">Here&apos;s your day at a glance.</p>

          {toggleError ? (
            <div className="toggle-error" role="alert">
              {toggleError}
            </div>
          ) : null}

          {loading ? (
            <LoadingState />
          ) : error ? (
            <ErrorState message={error} onRetry={load} />
          ) : (
            <div className="dashboard__grid">
              <TaskSection tasks={tasks} onToggleTask={handleToggleTask} onToggleChecklist={handleToggleTaskChecklist} savingItems={savingItems} />
              <ListSection
                lists={lists}
                sublists={sublists}
                expandedListId={expandedListId}
                onToggleExpand={toggleListExpanded}
                onToggleSublist={handleToggleSublist}
                savingItems={savingItems}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}