import EmptyState from './EmptyState';

// The Flutter app flattens ALL checklist items into one `sublists` array.
// Each item carries source ('task' | 'checklist') and parentId. We rebuild
// the parent-child hierarchy and render tick/untick checkboxes for each item.
// Both SublistSection and ListCard read from the same sublists state in
// Dashboard, so toggling in either section updates both views immediately.
export default function SublistSection({ sublists = [], tasks = [], lists = [], onToggleSublist, savingItems }) {
  const taskTitles = new Map((tasks || []).map((t) => [t.id, t.title]));
  const listTitles = new Map((lists || []).map((l) => [l.id, l.title]));

  const groupsById = new Map();

  for (const item of sublists) {
    if (!item || !item.text) continue;
    const parentLabel =
      item.source === 'task'
        ? taskTitles.get(item.parentId) || 'Task'
        : listTitles.get(item.parentId) || 'List';

    if (!groupsById.has(item.parentId)) {
      groupsById.set(item.parentId, {
        label: parentLabel,
        source: item.source,
        items: [],
      });
    }
    groupsById.get(item.parentId).items.push(item);
  }

  const groups = [...groupsById.values()];
  const hasAny = groups.some((g) => g.items.length > 0);
  const openCount = sublists.filter((s) => s && !s.completed && s.text).length;

  return (
    <section className="panel sublist-section">
      <div className="panel__header">
        <h2 className="panel__title">Today&apos;s Sublists</h2>
        {openCount > 0 ? <span className="panel__count">{openCount} open</span> : null}
      </div>

      {!hasAny ? (
        <EmptyState message="No sublists today." />
      ) : (
        <div className="sublist-groups">
          {groups.map((group) => (
            <div className="sublist-group" key={group.label + group.source}>
              <p className="sublist-group__label">{group.label}</p>
              <ul className="checklist">
                {group.items
                  .sort((a, b) => (a.position || 0) - (b.position || 0))
                  .map((item) => (
                    <li
                      key={item.id || item.text}
                      className={
                        item.completed
                          ? 'checklist__item checklist__item--done'
                          : 'checklist__item'
                      }
                    >
                      <button
                        type="button"
                        className={
                          item.completed
                            ? 'check-indicator check-indicator--checked'
                            : 'check-indicator'
                        }
                        role="checkbox"
                        aria-checked={item.completed}
                        aria-label={`Mark sublist "${item.text}" ${item.completed ? 'incomplete' : 'complete'}`}
                        disabled={savingItems.has(item.id)}
                        onClick={() => onToggleSublist(item.id)}
                      >
                        {item.completed ? '✓' : ''}
                      </button>
                      <span
                        className={
                          item.completed
                            ? 'checklist__text checklist__text--done'
                            : 'checklist__text'
                        }
                      >
                        {item.text}
                      </span>
                    </li>
                  ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}