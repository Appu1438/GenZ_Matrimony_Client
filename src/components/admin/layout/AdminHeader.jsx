import { useContext, useEffect, useRef, useState } from "react";
import { Menu, Search, Bell, ChevronDown, UserRound, Settings, LogOut } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { AdminAuthContext } from "../../../context/admin/AdminAuthContext";

// Adjust this path to where your AuthContext lives.

const pageNames = [
    ["/admin/dashboard", "Dashboard"],
    ["/admin/users", "Users"],
    ["/admin/profiles", "Profiles"],
    ["/admin/approvals", "Profile approvals"],
    ["/admin/matches", "Matches"],
    ["/admin/interests", "Interests"],
    ["/admin/reports", "Reports & complaints"],
    ["/admin/subscriptions", "Subscriptions"],
    ["/admin/analytics", "Analytics"],
    ["/admin/administrators", "Administrators"],
    ["/admin/settings", "Settings"],
    ["/admin/support", "Support"],
];

const AdminHeader = ({ onMenuClick, menuOpen = false }) => {
    const [profileMenuOpen, setProfileMenuOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const auth = useContext(AdminAuthContext);

    const profileRef = useRef(null);
    const searchRef = useRef(null);

    // Match nested routes too (e.g. /admin/users/42).
    const currentPage =
        pageNames.find(([path]) => location.pathname.startsWith(path))?.[1] || "Admin panel";

    const adminName = auth?.user?.name || auth?.user?.fullName || "Administrator";
    const adminRole = auth?.user?.role || "Super admin";
    const initial = adminName.trim().charAt(0).toUpperCase();
    const shortcut =
        typeof navigator !== "undefined" && /Mac/i.test(navigator.platform) ? "⌘ K" : "Ctrl K";

    useEffect(() => {
        setProfileMenuOpen(false);
    }, [location.pathname]);

    useEffect(() => {
        const onPointerDown = (event) => {
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setProfileMenuOpen(false);
            }
        };
        const onKey = (event) => {
            if (event.key === "Escape") setProfileMenuOpen(false);
            if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
                event.preventDefault();
                searchRef.current?.focus();
            }
        };
        document.addEventListener("mousedown", onPointerDown);
        document.addEventListener("keydown", onKey);
        return () => {
            document.removeEventListener("mousedown", onPointerDown);
            document.removeEventListener("keydown", onKey);
        };
    }, []);

    const handleLogout = async () => {
        setProfileMenuOpen(false);
        try {
            await auth?.logout?.();
        } finally {
            navigate("/login");
        }
    };

    return (
        <header className="admin-header">
            <div className="admin-header-left">
                <button
                    type="button"
                    className="admin-menu-toggle"
                    onClick={onMenuClick}
                    aria-label="Toggle navigation"
                    aria-expanded={menuOpen}
                >
                    <Menu size={23} />
                </button>

                <nav className="admin-breadcrumb" aria-label="Breadcrumb">
                    <strong>Admin</strong>
                    <span className="breadcrumb-separator" aria-hidden="true">/</span>
                    <strong aria-current="page">{currentPage}</strong>
                </nav>
            </div>

            <div className="admin-header-right">
                <label className="admin-header-search">
                    <Search size={17} />
                    <input ref={searchRef} type="search" placeholder="Search users, profiles, reports" aria-label="Search" />
                    <kbd>{shortcut}</kbd>
                </label>

                <button type="button" className="admin-icon-button" aria-label="Notifications" title="Notifications">
                    <Bell size={19} />
                    <span className="admin-notification-dot" />
                </button>

                <div className="admin-profile-wrapper" ref={profileRef}>
                    <button
                        type="button"
                        className="admin-profile-button"
                        onClick={() => setProfileMenuOpen((open) => !open)}
                        aria-haspopup="menu"
                        aria-expanded={profileMenuOpen}
                    >
                        <span className="admin-avatar">{initial}</span>
                        <span className="admin-profile-info">
                            <strong>{adminName}</strong>
                            <span>{adminRole}</span>
                        </span>
                        <ChevronDown size={16} className={profileMenuOpen ? "is-open" : ""} />
                    </button>

                    {profileMenuOpen && (
                        <div className="admin-profile-dropdown" role="menu">
                            <button type="button" role="menuitem" onClick={() => navigate("/admin/settings")}>
                                <UserRound size={17} /> My profile
                            </button>
                            <button type="button" role="menuitem" onClick={() => navigate("/admin/settings")}>
                                <Settings size={17} /> Settings
                            </button>
                            <div className="dropdown-divider" />
                            <button type="button" role="menuitem" className="dropdown-logout" onClick={handleLogout}>
                                <LogOut size={17} /> Log out
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default AdminHeader;