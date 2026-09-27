export default function Logo({ size = 'medium' }) {
  return (
    <div className={`logo logo--${size}`}>
      <span className="logo__mark" aria-hidden="true">
        P
      </span>
      <span className="logo__text">PYLO</span>
    </div>
  );
}