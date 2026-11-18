import { motion } from 'framer-motion';
import Logo from '../ui/Logo.jsx';
import './AuthLayout.css';

/**
 * Split-screen shell for /login, /register, /forgot-password, /reset-password.
 * Left: brand panel with the signature "connection thread" motif.
 * Right: whatever auth form is passed as children.
 * Collapses to a single column (form only, logo on top) below 900px.
 */
export function AuthLayout({ children }) {
  return (
    <div className="auth-layout">
      <aside className="auth-layout__panel" aria-hidden="true">
        <div className="auth-layout__panel-inner">
          <span className="auth-layout__logo-plate">
            <Logo size="md" />
          </span>

          <ConnectionThread />

          <p className="auth-layout__tagline">Find someone who matches your values.</p>
          <p className="auth-layout__subtagline">
            Real profiles, real intentions — built for a generation that wants a relationship
            that actually fits their life.
          </p>
        </div>

        <div className="auth-layout__panel-glow" />
      </aside>

      <main className="auth-layout__content">
        <div className="auth-layout__mobile-logo">
          <Logo size="md" />
        </div>
        {children}
      </main>
    </div>
  );
}

/**
 * Signature element: two nodes — the two people — linked by a curved path
 * that draws itself in, then settles into a slow breathing pulse. A quiet
 * echo of the logo's own two-figures-and-a-heart mark, without redrawing it.
 */
function ConnectionThread() {
  return (
    <svg
      className="connection-thread"
      viewBox="0 0 320 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="thread-gradient" x1="20" y1="40" x2="300" y2="120" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#EC1F6B" />
          <stop offset="100%" stopColor="#FF7A29" />
        </linearGradient>
      </defs>

      <motion.path
        d="M40 118 C 100 30, 220 30, 280 118"
        stroke="url(#thread-gradient)"
        strokeWidth="2.5"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
      />

      <motion.circle
        cx="40"
        cy="118"
        r="7"
        fill="url(#thread-gradient)"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
      />
      <motion.circle
        cx="280"
        cy="118"
        r="7"
        fill="url(#thread-gradient)"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.9 }}
      />

      <motion.circle
        cx="160"
        cy="46"
        r="4.5"
        fill="#fff"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: [0, 1.3, 1], opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 1.3 }}
      />
    </svg>
  );
}

export default AuthLayout;
