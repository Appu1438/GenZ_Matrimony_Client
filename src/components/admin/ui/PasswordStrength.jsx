import { getPasswordStrength } from '../../../utils/user/validation.js';
import './PasswordStrength.css';

export function PasswordStrength({ password }) {
  if (!password) return null;

  const { score, label } = getPasswordStrength(password);

  return (
    <div className="pw-strength" aria-live="polite">
      <div className="pw-strength__bars">
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className={`pw-strength__bar ${i < score ? `is-filled pw-strength__bar--${score}` : ''}`} />
        ))}
      </div>
      <span className="pw-strength__label">{label}</span>
    </div>
  );
}

export default PasswordStrength;
