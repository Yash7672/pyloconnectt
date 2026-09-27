export default function EmptyState({ message }) {
  return (
    <div className="empty-state">
      <div className="empty-state__icon" aria-hidden="true" />
      <p className="empty-state__message">{message}</p>
    </div>
  );
}