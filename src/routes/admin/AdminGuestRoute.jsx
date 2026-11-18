import { Navigate, Outlet } from "react-router-dom";
import { useAdminAuth } from "../../hooks/admin/useAdminAuth.js";

export default function AdminGuestRoute() {
    const { admin, status, isLoading } = useAdminAuth();

    // Wait until authentication check finishes.
    if (isLoading || status === "loading") {
        return (
            <main className="admin-gate-state">
                <div className="admin-gate-spinner" />
                <p>Checking session...</p>
            </main>
        );
    }

    // Already authenticated admin: don't allow login page.
    if (
        status === "authenticated" &&
        admin &&
        ["admin", "super_admin"].includes(admin.role)
    ) {
        return <Navigate to="/admin/dashboard" replace />;
    }

    return <Outlet />;
}