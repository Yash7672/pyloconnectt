import { useEffect, useRef, useState } from 'react';

function EyeIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c6.5 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3.5 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
      <line x1="2" x2="22" y1="2" y2="22" />
    </svg>
  );
}

export default function PasswordField({ id, label, value, onChange, autoComplete, error, ...rest }) {
  const [revealed, setRevealed] = useState(false);
  const toggleRef = useRef(null);

  // Suppress the compatibility mouse events browsers fire after a touch,
  // so the password hides on release instead of being re-shown by a
  // synthetic mouseenter while the finger is away.
  useEffect(() => {
    const el = toggleRef.current;
    if (!el) return;
    const stopCompatMouse = (e) => e.preventDefault();
    el.addEventListener('touchstart', stopCompatMouse, { passive: false });
    return () => el.removeEventListener('touchstart', stopCompatMouse);
  }, []);

  function show() {
    setRevealed(true);
  }

  function hide() {
    setRevealed(false);
  }

  return (
    <div className="field">
      <label className="field__label" htmlFor={id}>
        {label}
      </label>
      <div className="field__password">
        <input
          id={id}
          type={revealed ? 'text' : 'password'}
          autoComplete={autoComplete}
          className={`field__input${error ? ' field__input--error' : ''}`}
          value={value}
          onChange={onChange}
          {...rest}
        />
        <button
          ref={toggleRef}
          type="button"
          className="field__password-toggle"
          aria-label={revealed ? 'Hide password' : 'Show password'}
          onMouseEnter={show}
          onMouseDown={show}
          onMouseUp={hide}
          onMouseLeave={hide}
          onTouchStart={show}
          onTouchEnd={hide}
          onTouchCancel={hide}
          onFocus={show}
          onBlur={hide}
        >
          {revealed ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </div>
      {error ? (
        <p className="field__error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}