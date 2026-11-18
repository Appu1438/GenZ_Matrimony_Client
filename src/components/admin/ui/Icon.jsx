import logoSrc from '../../assets/icon-transparent.png';
import './Logo.css';

/**
 * Renders the official GenZ Matrimony logo asset as-is.
 * Do not recolor, distort, or recreate the mark — only size/placement varies.
 */
export function Icon({ size = 'md', className = '' }) {
  const heightBySize = { sm: 28, md: 36, lg: 48 };

  return (
    <img
      src={logoSrc}
      alt="GenZ Matrimony"
      className={`logo logo--${size} ${className}`.trim()}
      style={{ height: heightBySize[size] }}
    />
  );
}

export default Icon;
