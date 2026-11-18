import { motion } from 'framer-motion';
import './AuthCard.css';

export function AuthCard({ eyebrow, title, subtitle, children, footer }) {
  return (
    <motion.div
      className="auth-card"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="auth-card__header">
        {eyebrow && <span className="auth-card__eyebrow">{eyebrow}</span>}
        <h1 className="auth-card__title">{title}</h1>
        {subtitle && <p className="auth-card__subtitle">{subtitle}</p>}
      </div>

      <div className="auth-card__body">{children}</div>

      {footer && <div className="auth-card__footer">{footer}</div>}
    </motion.div>
  );
}

export default AuthCard;
