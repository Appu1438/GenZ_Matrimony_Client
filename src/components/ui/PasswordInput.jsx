import { forwardRef, useState } from 'react';
import Input from './Input.jsx';
import './PasswordInput.css';

export const PasswordInput = forwardRef(function PasswordInput(
  { className = '', autoComplete = 'current-password', ...rest },
  ref
) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="password-input">
      <Input
        ref={ref}
        type={visible ? 'text' : 'password'}
        autoComplete={autoComplete}
        className={`password-input__field ${className}`.trim()}
        {...rest}
      />
      <button
        type="button"
        className="password-input__toggle"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? 'Hide password' : 'Show password'}
        aria-pressed={visible}
      >
        {visible ? <EyeOffIcon /> : <EyeIcon />}
      </button>
    </div>
  );
});

function EyeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M3 3l18 18M10.6 10.7a3 3 0 0 0 4.24 4.24M9.36 5.3A10.7 10.7 0 0 1 12 5c6.4 0 10 7 10 7a13.9 13.9 0 0 1-3.16 4.05M6.6 6.6C4.16 8.2 2 12 2 12s3.6 7 10 7c1.13 0 2.17-.16 3.1-.45"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default PasswordInput;
