
import { useCallback, useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useProfile } from "../hooks/useProfile.js";

const PROFILE_ROUTES = {
    setup: "/profile-setup",
    status: "/profile-status",
    app: "/app",
};

const STATUS_DESTINATIONS = {
    not_created: PROFILE_ROUTES.setup,
    draft: PROFILE_ROUTES.setup,
    pending_review: PROFILE_ROUTES.status,
    needs_changes: PROFILE_ROUTES.status,
    rejected: PROFILE_ROUTES.status,
    approved: PROFILE_ROUTES.app,
};

function LoadingProfile() {
    return (
        <main className="profile-gate-state">
            <div className="profile-gate-spinner" />
            <p>Checking your profile...</p>
        </main>
    );
}

export default function ProfileGate() {
    const location = useLocation();

    const {
        profileStatus,
        isLoading,
        error,
        refreshProfile,
    } = useProfile();

    const [hasLoaded, setHasLoaded] = useState(false);

    const checkProfile = useCallback(async () => {
        await refreshProfile();
    }, [refreshProfile]);

    // Initial profile check
    useEffect(() => {
        let active = true;

        checkProfile()
            .catch(() => { })
            .finally(() => {
                if (active) setHasLoaded(true);
            });

        return () => {
            active = false;
        };
    }, [checkProfile]);

    // Automatically check for profile status changes
    useEffect(() => {
        const interval = setInterval(() => {
            if (document.visibilityState === "visible") {
                checkProfile().catch(() => { });
            }
        }, 30000);

        return () => clearInterval(interval);
    }, [checkProfile]);

    // Check when the user returns to the application
    useEffect(() => {
        const handleFocus = () => {
            if (document.visibilityState === "visible") {
                checkProfile().catch(() => { });
            }
        };

        window.addEventListener("focus", handleFocus);

        return () => {
            window.removeEventListener("focus", handleFocus);
        };
    }, [checkProfile]);

    if (!hasLoaded || isLoading || profileStatus === "unknown") {
        return <LoadingProfile />;
    }

    if (error) {
        return (
            <main className="profile-gate-state">
                <h2>We couldn't load your profile</h2>
                <p>{error}</p>

                <button type="button" onClick={() => checkProfile().catch(() => { })}>
                    Try again
                </button>
            </main>
        );
    }

    const path = location.pathname;
    const target = STATUS_DESTINATIONS[profileStatus];

    if (!target) {
        return <LoadingProfile />;
    }

    // Users who need changes can access both status and setup pages
    if (
        profileStatus === "needs_changes" &&
        [PROFILE_ROUTES.status, PROFILE_ROUTES.setup].includes(path)
    ) {
        return <Outlet />;
    }

    // Allow users to access only their appropriate page
    if (path !== target) {
        return <Navigate to={target} replace state={{ from: location }} />;
    }

    return <Outlet />;
}
