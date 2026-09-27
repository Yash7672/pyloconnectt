import { formatEpochMs } from '../utils/dateUtils';

// Read-only task display with two interactive controls: the task completion
// checkbox and per-item checkboxes for the task's embedded checklist. All
// other task data is display-only.
export default function TaskCard({
  task,
  onToggle,
  onToggleChecklist,
  savingItems = new Set(),
  saving = false,
}) {
  const completed = Boolean(task.isCompleted);
  const checklist = task.checklist || [];
  const doneCount = checklist.filter((i) => i.done).length;

  return (
    <div className={`task-card${completed ? ' task-card--completed' : ''}`}>
      <button
        type="button"
        className={`task-checkbox${completed ? ' task-checkbox--checked' : ''}`}
        role="checkbox"
        aria-checked={completed}
        aria-label={`Mark task "${task.title || 'Untitled task'}" ${completed ? 'incomplete' : 'complete'}`}
        disabled={saving}
        onClick={() => onToggle(task.id)}
      >
        {completed ? '✓' : ''}
      </button>

      <div className="task-card__body">
        <p className="task-card__title">{task.title || 'Untitled task'}</p>

        {task.description ? (
          <p className="task-card__description">{task.description}</p>
        ) : null}

        <div className="task-card__meta">
          {task.category ? (
            <span className="chip chip--category">{task.category}</span>
          ) : null}

          {task.priority && task.priority !== 'None' ? (
            <span
              className={`chip chip--priority chip--priority-${String(task.priority).toLowerCase()}`}
            >
              {task.priority}
            </span>
          ) : null}

          {task.dueDate ? (
            <span className="chip chip--time">
              {formatEpochMs(task.dueDate)}
            </span>
          ) : null}

          {task.startTime && task.endTime ? (
            <span className="chip chip--time">
              {formatEpochMs(task.startTime)} – {formatEpochMs(task.endTime)}
            </span>
          ) : null}

          {task.color ? (
            <span
              className="color-dot"
              style={{ backgroundColor: task.color }}
              title={`Color: ${task.color}`}
            />
          ) : null}
        </div>

        {checklist.length > 0 ? (
          <div className="task-card__checklist">
            <ul className="checklist task-card__checklist-items">
              {checklist.map((item, index) => {
                const itemDone = Boolean(item.done);
                const itemSaving = savingItems.has(`${task.id}:${index}`);
                return (
                  <li
                    key={index}
                    className={
                      itemDone
                        ? 'checklist__item checklist__item--done'
                        : 'checklist__item'
                    }
                  >
                    <button
                      type="button"
                      className={
                        itemDone
                          ? 'check-indicator check-indicator--checked'
                          : 'check-indicator'
                      }
                      role="checkbox"
                      aria-checked={itemDone}
                      aria-label={`Mark checklist item "${item.text}" ${itemDone ? 'incomplete' : 'complete'}`}
                      disabled={itemSaving}
                      onClick={() =>
                        onToggleChecklist(task.id, index)
                      }
                    >
                      {itemDone ? '✓' : ''}
                    </button>
                    <span
                      className={
                        itemDone
                          ? 'checklist__text checklist__text--done'
                          : 'checklist__text'
                      }
                    >
                      {item.text}
                    </span>
                  </li>
                );
              })}
            </ul>
            <p className="task-card__checklist-progress">
              {doneCount}/{checklist.length} completed
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}