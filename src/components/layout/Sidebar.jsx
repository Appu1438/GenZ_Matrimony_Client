import './Sidebar.css';

const NAV_ITEMS = [
  { label: 'Discover', icon: CompassIcon, active: true },
  { label: 'Matches', icon: HeartIcon },
  { label: 'Messages', icon: ChatIcon },
  { label: 'Interests', icon: StarIcon },
  { label: 'Profile', icon: UserIcon },
  { label: 'Settings', icon: SettingsIcon },
];

/**
 * Placeholder primary navigation for the /app shell.
 * Items are non-functional until Discovery, Matching, and Chat are built.
 */
export function Sidebar() {
  return (
    <nav className="sidebar" aria-label="Primary">
      <ul className="sidebar__list">
        {NAV_ITEMS.map(({ label, icon: Icon, active }) => (
          <li key={label}>
            <button type="button" className={`sidebar__item ${active ? 'is-active' : ''}`} disabled={!active}>
              <Icon />
              <span>{label}</span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function iconProps() {
  return { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', 'aria-hidden': true };
}

function CompassIcon() {
  return (
    <svg {...iconProps()}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.7" />
      <path d="M15 9l-2 6-4 2 2-6 4-2Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    </svg>
  );
}
function HeartIcon() {
  return (
    <svg {...iconProps()}>
      <path
        d="M12 20s-7-4.35-9.5-8.5C.7 8 2.4 4.5 6 4.5c2 0 3.3 1 4 2.2.7-1.2 2-2.2 4-2.2 3.6 0 5.3 3.5 3.5 7C19 15.65 12 20 12 20Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function ChatIcon() {
  return (
    <svg {...iconProps()}>
      <path
        d="M4 5h16v11H8l-4 4V5Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function StarIcon() {
  return (
    <svg {...iconProps()}>
      <path
        d="M12 3l2.6 5.6L21 9.3l-4.5 4.2L17.6 21 12 17.7 6.4 21l1.1-7.5L3 9.3l6.4-0.7L12 3Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function UserIcon() {
  return (
    <svg {...iconProps()}>
      <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.7" />
      <path d="M4.5 20c1.4-3.6 4.4-5.5 7.5-5.5s6.1 1.9 7.5 5.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}
function SettingsIcon() {
  return (
    <svg {...iconProps()}>
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.7" />
      <path
        d="M12 3v2.2M12 18.8V21M21 12h-2.2M5.2 12H3M18 6l-1.5 1.5M7.5 16.5 6 18M18 18l-1.5-1.5M7.5 7.5 6 6"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default Sidebar;
