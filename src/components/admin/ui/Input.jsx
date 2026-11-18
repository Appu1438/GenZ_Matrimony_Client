import { forwardRef } from 'react';
import './Input.css';

export const Input = forwardRef(function Input({ className = '', ...rest }, ref) {
  return <input ref={ref} className={`input ${className}`.trim()} {...rest} />;
});

export default Input;
