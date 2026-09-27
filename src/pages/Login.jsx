import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Logo from '../components/Logo';
import ThemeToggle from '../components/ThemeToggle';
import PasswordField from '../components/PasswordField';
import { signInWithEmail } from '../services/authService';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  function validate() {
    const errs = {};
    if (!email.trim()) errs.email = 'Please enter your email.';
    if (!password) errs.password = 'Please enter your password.';
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!validate()) return;

    setLoading(true);

    let authError = null;
    try {
      const result = await signInWithEmail(email.trim(), password);
      authError = result.error;
    } catch (err) {
      console.error('PYLO Web: login request failed', err);
      setError('Unable to connect to the server. Check your internet connection.');
      setLoading(false);
      return;
    }

    setLoading(false);

    if (authError) {
      console.error('PYLO Web: login auth error', {
        status: authError.status,
        code: authError.code,
        message: authError.message,
      });
      if (authError.message?.includes('Invalid login')) {
        setError('Invalid email or password.');
      } else if (authError.status === 401 || authError.code === 'invalid_api_key') {
        setError('Unable to connect to PYLO. Check cloud configuration.');
      } else if (
        /fetch|network|ECONNREFUSED|ERR_|Failed to fetch/i.test(authError.message || '')
      ) {
        setError('Unable to connect to the server. Check your internet connection.');
      } else {
        setError('Login failed. Please try again.');
      }
      return;
    }

    navigate('/dashboard');
  }

  return (
    <div className="login">
      <ThemeToggle compact />

      <div className="login__card">
        <Logo size="medium" />

        <p className="login__welcome">Welcome back</p>

        <form className="login__form" onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label className="field__label" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              className={`field__input${fieldErrors.email ? ' field__input--error' : ''}`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {fieldErrors.email ? (
              <p className="field__error" role="alert">
                {fieldErrors.email}
              </p>
            ) : null}
          </div>

          <PasswordField
            id="password"
            label="Password"
            autoComplete="current-password"
            error={fieldErrors.password}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {error ? (
            <p className="login__error" role="alert">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            className="btn btn--primary btn--full"
            disabled={loading}
          >
            {loading ? 'Signing in…' : 'Login'}
          </button>
        </form>

        <Link to="/" className="login__back">
          Back to home
        </Link>
      </div>
    </div>
  );
}