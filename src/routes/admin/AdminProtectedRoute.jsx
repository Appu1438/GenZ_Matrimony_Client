import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAdminAuth } from "../../hooks/admin/useAdminAuth";

function AdminLoading() {
    return (
        <main className="admin-gate-state">
            <div className="admin-gate-spinner" />
            <p>Verifying administrator access...</p>
        </main>
    );
}

export default function AdminProtectedRoute() {
    const { admin, status, isLoading } = useAdminAuth();
    const location = useLocation();

    // Wait until the admin session has been checked.
    if (isLoading || status === "loading") {
        return <AdminLoading />;
    }

    // No authenticated admin: redirect to admin login.
    if (
        status !== "authenticated" ||
        !admin ||
        !["admin", "super_admin"].includes(admin.role)
    ) {
        return (
            <Navigate
                to="/admin/login"
                replace
                state={{ from: location }}
            />
        );
    }

    return <Outlet />;
}