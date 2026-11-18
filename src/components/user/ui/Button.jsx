import './Button.css';

/**
 * @param {'primary'|'secondary'|'ghost'} variant
 * @param {boolean} isLoading - shows a spinner + custom label, disables the button
 * @param {string} loadingText - label shown while isLoading is true
 */
export function Button({
  variant = 'primary',
  isLoading = false,
  loadingText,
  disabled,
  children,
  className = '',
  type = 'button',
  ...rest
}) {
  return (
    <button
      type={type}
      className={`btn btn--${variant} ${className}`.trim()}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      {...rest}
    >
      {isLoading && <span className="btn__spinner" aria-hidden="true" />}
      <span>{isLoading ? loadingText || children : children}</span>
    </button>
  );
}

export default Button;
