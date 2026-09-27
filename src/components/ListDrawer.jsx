import { useEffect } from 'react';

// Slide-in drawer that shows ONE list's sublists. Opens on list tap, closes
// on the × button, backdrop click or Escape. Only the item checkboxes are
// interactive — every other control lives in the Flutter app.
export default function ListDrawer({ list, items = [], onClose, onToggleSublist, savingItems }) {
  const doneCount = items.filter((i) => i.completed).length;

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Lock body scroll while the drawer is open, restore on unmount.
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  return (
    <div className="drawer-layer">
      <div className="drawer-backdrop" onClick={onClose} />

      <aside
        className="drawer"
        role="dialog"
        aria-modal="true"
        aria-label={list.title || 'List items'}
      >
        <header className="drawer__header">
          <div>
            <h3 className="drawer__title">{list.title || 'Untitled list'}</h3>
            <span className="drawer__progress">
              {doneCount} of {items.length} done
            </span>
          </div>
          <button
            type="button"
            className="drawer__close"
            onClick={onClose}
            aria-label="Close list"
          >
            ×
          </button>
        </header>

        <div className="drawer__body">
          {items.length === 0 ? (
            <p className="checklist__empty">No items in this list.</p>
          ) : (
            <ul className="checklist">
              {items.map((item) => (
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
                    aria-label={`Mark "${item.text}" ${item.completed ? 'incomplete' : 'complete'}`}
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
          )}
        </div>
      </aside>
    </div>
  );
}