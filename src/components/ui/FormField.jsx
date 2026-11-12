import { useId } from 'react';
import './FormField.css';

/**
 * Lays out a label + control + error/help text, and wires up the
 * aria-describedby / aria-invalid relationship automatically.
 * Pass `id`/`aria-describedby`/`aria-invalid` through to the child via renderControl.
 */
export function FormField({ label, error, hint, htmlFor, required, children }) {
  const generatedId = useId();
  const fieldId = htmlFor || generatedId;
  const errorId = `${fieldId}-error`;
  const hintId = `${fieldId}-hint`;

  return (
    <div className={`form-field ${error ? 'form-field--invalid' : ''}`.trim()}>
      <label htmlFor={fieldId} className="form-field__label">
        {label}
        {required && (
          <span className="form-field__required" aria-hidden="true">
            *
          </span>
        )}
      </label>

      {typeof children === 'function'
        ? children({
            id: fieldId,
            'aria-invalid': !!error || undefined,
            'aria-describedby': error ? errorId : hint ? hintId : undefined,
          })
        : children}

      {hint && !error && (
        <p id={hintId} className="form-field__hint">
          {hint}
        </p>
      )}

      {error && (
        <p id={errorId} className="form-field__error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export default FormField;
