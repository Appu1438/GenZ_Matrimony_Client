import { useCallback, useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";

import "./AdminLayout.css";
import "./AdminCommon.css";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";
import AdminFooter from "./AdminFooter";

const AdminLayout = ({children}) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const location = useLocation();

    const toggleSidebar = useCallback(() => setSidebarOpen((open) => !open), []);
    const closeSidebar = useCallback(() => setSidebarOpen(false), []);

    // Close the drawer after navigating, and on Escape.
    useEffect(() => {
        closeSidebar();
    }, [location.pathname, closeSidebar]);

    useEffect(() => {
        if (!sidebarOpen) return undefined;
        const onKey = (event) => event.key === "Escape" && closeSidebar();
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [sidebarOpen, closeSidebar]);

    return (
        <div className="admin-layout">
            <a href="#admin-content" className="visually-hidden admin-skip-link">
                Skip to content
            </a>

            <AdminSidebar isOpen={sidebarOpen} onNavigate={closeSidebar} />

            {sidebarOpen && (
                <div className="admin-sidebar-overlay" onClick={closeSidebar} aria-hidden="true" />
            )}

            <div className="admin-main">
                <AdminHeader onMenuClick={toggleSidebar} menuOpen={sidebarOpen} />

                <main id="admin-content" className="admin-content">
                    <div className="admin-page-container">
                        {children}
                    </div>
                    <AdminFooter />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;