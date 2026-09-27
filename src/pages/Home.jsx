import { Link } from 'react-router-dom';
import Logo from '../components/Logo';
import ThemeToggle from '../components/ThemeToggle';

export default function Home({ session }) {
  return (
    <div className="home">
      <ThemeToggle compact />

      <div className="home__content">
        <Logo size="large" />

        <h1 className="home__tagline">Your tasks. Anywhere.</h1>

        <p className="home__subline">
          Stay organized across your PYLO app and web dashboard.
        </p>

        <div className="home__actions">
          <a
            href="/download"
            className="btn btn--primary btn--lg"
          >
            Download App
          </a>

          {session ? (
            <Link
              to="/dashboard"
              className="btn btn--outline btn--lg"
            >
              Dashboard
            </Link>
          ) : (
            <Link
              to="/login"
              className="btn btn--outline btn--lg"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}