import { useId } from 'react';
import './Checkbox.css';

export function Checkbox({ label, checked, onChange, error, id, className = '', ...rest }) {
  const generatedId = useId();
  const checkboxId = id || generatedId;

  return (
    <div className={`checkbox ${className}`.trim()}>
      <div className="checkbox__row">
        <input
          id={checkboxId}
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="checkbox__input"
          aria-invalid={!!error || undefined}
          {...rest}
        />
        <label htmlFor={checkboxId} className="checkbox__label">
          {label}
        </label>
      </div>
      {error && (
        <p className="checkbox__error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export default Checkbox;
