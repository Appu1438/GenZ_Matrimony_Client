
import { Navigate, Outlet, useLocation } from "react-router-dom";
import useAuth from "../../hooks/user/useAuth.js";

export function GuestRoute( ) {
    const { isAuthenticated, isLoading } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return (
            <div
                style={{
                    display: "grid",
                    placeItems: "center",
                    minHeight: "100vh",
                    color: "var(--color-text-muted)",
                }}
            >
                Loading…
            </div>
        );
    }

    if (isAuthenticated) {
        return (
            <Navigate
                to={location.state?.from || "/app"}
                replace
            />
        );
    }

    return <Outlet />;
}

export default GuestRoute;
