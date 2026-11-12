
import { Link } from 'react-router-dom';
import Logo from '../ui/Logo.jsx';
import './Footer.css';

export function Footer() {
  return (
    <footer className="app-footer">

      <div className="app-footer__main">

        {/* Brand */}
        <div className="app-footer__brand">
          <Link to="/app" className="app-footer__logo">
            <Logo size="md" />
          </Link>

          <p>
            Meaningful connections. Genuine relationships.
            Helping you find someone who shares your values,
            dreams and vision for the future.
          </p>

          <div className="app-footer__trust">
            <span className="app-footer__trust-icon">
              <svg viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="1.8"
                strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z" />
                <path d="m9 12 2 2 4-4" />
              </svg>
            </span>
            <span>Built around trust and meaningful connections</span>
          </div>
        </div>

        {/* Quick Links */}
        <div className="app-footer__column">
          <h3>Explore</h3>
          <Link to="/app">Home</Link>
          <Link to="/app">Discover Profiles</Link>
          <Link to="/app">My Account</Link>
        </div>

        {/* Help */}
        <div className="app-footer__column">
          <h3>Help & Support</h3>
          <Link to="/support">Help Center</Link>
          <Link to="/support">Contact Support</Link>
          <Link to="/support">Account Assistance</Link>
        </div>

        {/* Legal */}
        <div className="app-footer__column">
          <h3>Legal</h3>
          <Link to="/terms">Terms & Conditions</Link>
          <Link to="/privacy">Privacy Policy</Link>
        </div>

      </div>

      {/* Bottom Bar */}
      <div className="app-footer__bottom">
        <span>
          © {new Date().getFullYear()} GenZ Matrimony. All rights reserved.
        </span>

        <span className="app-footer__bottom-message">
          Made for meaningful connections
          <svg viewBox="0 0 24 24" fill="currentColor"
            aria-hidden="true">
            <path d="M12 21s-8-4.6-8-11a5 5 0 0 1 8-4 5 5 0 0 1 8 4c0 6.4-8 11-8 11Z" />
          </svg>
        </span>
      </div>

    </footer>
  );
}

export default Footer;
