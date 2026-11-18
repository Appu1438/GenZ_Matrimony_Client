import { NavLink } from "react-router-dom";
import {
    LayoutDashboard,
    Users,
    UserRound,
    ClipboardCheck,
    Heart,
    MessageCircle,
    Flag,
    CreditCard,
    ChartNoAxesCombined,
    Settings,
    ShieldCheck,
    Headset,
    ChevronRight,
    X,
} from "lucide-react";
import Logo from "../ui/Logo";

import packageJson from "../../../../package.json";

const APP_VERSION = packageJson.version;
const menuGroups = [
    {
        title: "Overview",
        items: [{ label: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard }],
    },
    {
        title: "Management",
        items: [
            { label: "Users", path: "/admin/users", icon: Users },
            { label: "Profiles", path: "/admin/profiles", icon: UserRound },
            { label: "Profile approvals", path: "/admin/approvals", icon: ClipboardCheck, badgeKey: "approvals" },
            { label: "Matches", path: "/admin/matches", icon: Heart },
            { label: "Interests", path: "/admin/interests", icon: MessageCircle },
            { label: "Reports & complaints", path: "/admin/reports", icon: Flag, badgeKey: "reports" },
        ],
    },
    {
        title: "Business",
        items: [
            { label: "Subscriptions", path: "/admin/subscriptions", icon: CreditCard },
            { label: "Analytics", path: "/admin/analytics", icon: ChartNoAxesCombined },
        ],
    },
    {
        title: "System",
        items: [
            { label: "Administrators", path: "/admin/administrators", icon: ShieldCheck },
            { label: "Settings", path: "/admin/settings", icon: Settings },
            { label: "Support", path: "/admin/support", icon: Headset },
        ],
    },
];

/**
 * counts: optional badge numbers, e.g. { approvals: 12, reports: 3 }
 */
const AdminSidebar = ({ isOpen, onNavigate, counts = {} }) => (
    <aside
        className={`admin-sidebar ${isOpen ? "admin-sidebar-open" : ""}`}
        aria-label="Admin navigation"
    >
        <div className="admin-sidebar-brand">
            <div className="admin-brand-text">
                <Logo size="lg" mode='normal' />
            </div>
            <button
                type="button"
                className="admin-mobile-close"
                onClick={onNavigate}
                aria-label="Close sidebar"
            >
                <X size={20} />
            </button>
        </div>

        <nav className="admin-sidebar-nav">
            {menuGroups.map((group) => (
                <div className="admin-menu-group" key={group.title}>
                    <p className="admin-menu-title">{group.title}</p>

                    {group.items.map(({ label, path, icon: Icon, badgeKey }) => {
                        const count = badgeKey ? counts[badgeKey] : 0;

                        return (
                            <NavLink
                                key={path}
                                to={path}
                                onClick={onNavigate}
                                className={({ isActive }) =>
                                    `admin-nav-link ${isActive ? "active" : ""}`
                                }
                            >
                                <Icon size={19} strokeWidth={1.8} />
                                <span>{label}</span>
                                {count > 0 && (
                                    <em className="admin-nav-badge">{count > 99 ? "99+" : count}</em>
                                )}
                            </NavLink>
                        );
                    })}
                </div>
            ))}
        </nav>

        <div className="admin-sidebar-bottom">
            <NavLink to="/admin/support" onClick={onNavigate} className="admin-sidebar-help">
                <span className="admin-help-icon">
                    <Headset size={19} />
                </span>
                <span className="admin-help-text">
                    <strong>Need assistance?</strong>
                    <span>Contact the support team</span>
                </span>
                <ChevronRight size={16} />
            </NavLink>

            <div className="admin-sidebar-version">
                <span>GenZ Matrimony</span>
                <span>Admin Panel v{APP_VERSION}</span>
            </div>
        </div>
    </aside>
);

export default AdminSidebar;