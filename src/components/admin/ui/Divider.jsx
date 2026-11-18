import './Divider.css';

export function Divider({ label = 'or' }) {
  return (
    <div className="divider" role="separator">
      <span className="divider__line" />
      <span className="divider__label">{label}</span>
      <span className="divider__line" />
    </div>
  );
}

export default Divider;
