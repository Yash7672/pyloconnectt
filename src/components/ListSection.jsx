import ListCard from './ListCard';
import EmptyState from './EmptyState';

// Wrapper for Today's Lists. Lists start collapsed — only their names show
// (with a right-arrow marker). Tapping a list's header expands its sublists
// inline; at most one list is expanded at a time (single-open accordion).
export default function ListSection({
  lists = [],
  sublists = [],
  expandedListId = null,
  onToggleExpand,
  onToggleSublist,
  savingItems,
}) {
  const itemsByListId = new Map();

  for (const item of sublists) {
    if (item.source !== 'checklist') continue;
    if (!itemsByListId.has(item.parentId)) {
      itemsByListId.set(item.parentId, []);
    }
    itemsByListId.get(item.parentId).push(item);
  }

  return (
    <section className="panel list-section">
      <div className="panel__header">
        <h2 className="panel__title">Today&apos;s Lists</h2>
        {lists.length > 0 ? <span className="panel__count">{lists.length}</span> : null}
      </div>

      {lists.length === 0 ? (
        <EmptyState message="No lists today." />
      ) : (
        <div className="list-cards">
          {lists.map((list) => (
            <ListCard
              key={list.id}
              list={list}
              items={itemsByListId.get(list.id) || []}
              expanded={expandedListId === list.id}
              onToggleExpand={() => onToggleExpand(list.id)}
              onToggleSublist={onToggleSublist}
              savingItems={savingItems}
            />
          ))}
        </div>
      )}
    </section>
  );
}