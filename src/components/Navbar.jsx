import Logo from './Logo';
import ThemeToggle from './ThemeToggle';
import { signOut } from '../services/authService';

export default function Navbar({ email }) {
  async function handleLogout() {
    await signOut();
    window.location.href = '/login';
  }

  return (
    <nav className="navbar">
      <Logo size="small" />

      <div className="navbar__right">
        {email ? <span className="navbar__email">{email}</span> : null}
        <ThemeToggle />
        <button type="button" className="btn btn--outline btn--sm" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
}