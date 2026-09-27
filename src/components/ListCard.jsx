// Expandable list card. Initially only the list name shows; tapping the
// header expands its sublists directly underneath (smooth CSS animation).
// List/subitem names are read-only; only the checkboxes are interactive.
export default function ListCard({
  list,
  items = [],
  expanded,
  onToggleExpand,
  onToggleSublist,
  savingItems,
}) {
  const doneCount = items.filter((i) => i.completed).length;

  return (
    <div className={`list-card${expanded ? ' list-card--expanded' : ''}`}>
      <button
        type="button"
        className="list-card__header"
        aria-expanded={expanded}
        onClick={onToggleExpand}
      >
        <span className="list-card__title">{list.title || 'Untitled list'}</span>
        {items.length > 0 ? (
          <span className="list-card__progress">
            {doneCount} of {items.length} done
          </span>
        ) : null}
        <svg
          className="list-card__chevron"
          viewBox="0 0 24 24"
          width="18"
          height="18"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      <div className="list-card__collapse">
        <ul className="list-card__items">
          {items.length === 0 ? (
            <li className="list-card__empty">No items in this list.</li>
          ) : (
            items.map((item) => (
              <li
                key={item.id || item.text}
                className={
                  item.completed
                    ? 'list-card__item list-card__item--done'
                    : 'list-card__item'
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
                  aria-label={`Mark "${item.text}" ${item.completed ? 'incomplete' : 'complete'}`}
                  disabled={savingItems.has(item.id)}
                  onClick={() => onToggleSublist(item.id)}
                >
                  {item.completed ? '✓' : ''}
                </button>
                <span
                  className={
                    item.completed
                      ? 'list-card__text list-card__text--done'
                      : 'list-card__text'
                  }
                >
                  {item.text}
                </span>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}