import TaskCard from './TaskCard';
import EmptyState from './EmptyState';

export default function TaskSection({
  tasks,
  onToggleTask,
  onToggleChecklist,
  savingItems,
}) {
  const visibleTasks = (tasks || []).filter((t) => !t.isDeleted);

  return (
    <section className="panel task-section">
      <div className="panel__header">
        <h2 className="panel__title">Today&apos;s Tasks</h2>
        {visibleTasks.length > 0 ? (
          <span className="panel__count">{visibleTasks.length}</span>
        ) : null}
      </div>

      {visibleTasks.length === 0 ? (
        <EmptyState message="No tasks today." />
      ) : (
        <ul className="task-list">
          {visibleTasks.map((task) => (
            <li key={task.id || task.title}>
              <TaskCard
                task={task}
                onToggle={onToggleTask}
                onToggleChecklist={onToggleChecklist}
                saving={savingItems.has(task.id)}
                savingItems={savingItems}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}