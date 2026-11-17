
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

    // Approved users can access any protected page
    // Approved users can access protected pages,
    // but profile setup is allowed only in edit mode.
    if (profileStatus === "approved") {
        const isProfileSetup = path === PROFILE_ROUTES.setup;

        const searchParams = new URLSearchParams(location.search);
        const isEditMode = searchParams.get("mode") === "edit";

        if (isProfileSetup && !isEditMode) {
            return <Navigate to={PROFILE_ROUTES.app} replace />;
        }

        return <Outlet />;
    }

    // Users who need changes can access both status and setup pages
    if (
        profileStatus === "needs_changes" &&
        [PROFILE_ROUTES.status, PROFILE_ROUTES.setup].includes(path)
    ) {
        return <Outlet />;
    }

    // Other users can access only their appropriate page
    if (path !== target) {
        return <Navigate to={target} replace state={{ from: location }} />;
    }

    return <Outlet />;
}
