import logoSrc from '../../../assets/logo.png';
import logoWhiteSrc from '../../../assets/logo-white.png';
import './Logo.css';

/**
 * Renders the official GenZ Matrimony logo asset as-is.
 * Do not recolor, distort, or recreate the mark — only size/placement varies.
 */
export function Logo({ size = 'md', className = '', mode = 'normal' }) {
  const heightBySize = { sm: 28, md: 36, lg: 48 };

  return (
    <img
      src={mode === 'white' ? logoWhiteSrc : logoSrc}
      alt="GenZ Matrimony"
      className={`logo logo--${size} ${className}`.trim()}
      style={{ height: heightBySize[size] }}
    />
  );
}

export default Logo;
