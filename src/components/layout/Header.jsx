import { Link } from 'react-router-dom';
import Logo from '../ui/Logo.jsx';
import Icon from '../ui/Icon.jsx';
import useAuth from '../../hooks/useAuth.js';
import './Header.css';

export function Header() {
  const { user, logout } = useAuth();

  const initials = (user?.fullName || 'GZ')
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <header className="app-header">
      <Link to="/app" className="app-header__brand">
        <Logo size="lg" />
      </Link>

      <div className="app-header__actions">
        <span className="app-header__user" title={user?.email}>
          <span className="app-header__avatar" aria-hidden="true">
            {initials}
          </span>
          <span className="app-header__name">{user?.fullName || 'Guest'}</span>
        </span>
        {user && (
          <button type="button" className="app-header__logout" onClick={logout}>
            Log out
          </button>
        )}
      </div>
    </header>
  );
}

export default Header;
