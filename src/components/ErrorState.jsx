export default function ErrorState({ message, onRetry }) {
  return (
    <div className="error-state" role="alert">
      <div className="error-state__icon" aria-hidden="true" />
      <p className="error-state__message">{message}</p>
      {onRetry ? (
        <button
          type="button"
          className="btn btn--outline btn--sm"
          onClick={onRetry}
        >
          Retry
        </button>
      ) : null}
    </div>
  );
}