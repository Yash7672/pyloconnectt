export default function LoadingState({ label = 'Loading your day…' }) {
  return (
    <div className="loading-state" role="status">
      <div className="loading-state__spinner" aria-hidden="true" />
      <p className="loading-state__label">{label}</p>
    </div>
  );
}