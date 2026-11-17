
import { useNavigate } from "react-router-dom";

import Button from "../../components/ui/Button.jsx";
import { useProfile } from "../../hooks/useProfile.js";
import ProfileStatusCard from "../../components/profile/ProfileStatusCard.jsx";
import AppLayout from "../../components/layout/AppLayout.jsx";

export default function ProfileStatus() {
    const navigate = useNavigate();

    const {
        profile,
        profileStatus,
        refreshProfile,
        isLoading,

        revision,
        revisionStatus,
        refreshRevision,
        isRevisionLoading,
    } = useProfile();

    // =========================================================
    // Initial Profile Pending Review
    // =========================================================

    if (profileStatus === "pending_review") {
        return (
            <AppLayout>
                <ProfileStatusCard
                    variant="pending"
                    title="Your profile is under review"
                >
                    <p>
                        Thank you for submitting your profile. Our team will review
                        your information before it becomes visible to other members.
                    </p>

                    {profile?.submittedAt && (
                        <p className="profile-status-meta">
                            Submitted on{" "}
                            {new Date(profile.submittedAt).toLocaleDateString()}
                        </p>
                    )}

                    <ol className="profile-status-track" aria-label="Review progress">
                        <li className="is-done">Profile submitted</li>
                        <li className="is-current">Review by our team</li>
                        <li>Visible to other members</li>
                    </ol>

                    <Button
                        type="button"
                        onClick={refreshProfile}
                        isLoading={isLoading}
                        loadingText="Checking..."
                    >
                        Refresh status
                    </Button>
                </ProfileStatusCard>
            </AppLayout>
        );
    }

    // =========================================================
    // Initial Profile Needs Changes
    // =========================================================

    if (profileStatus === "needs_changes") {
        return (
            <AppLayout>
                <ProfileStatusCard
                    variant="needs-changes"
                    title="Some changes are needed"
                >
                    <p>
                        Please review the admin's feedback and update your profile
                        before submitting it again.
                    </p>

                    {profile?.reviewNote && (
                        <blockquote className="profile-status-note">
                            <span>Note from our team</span>
                            {profile.reviewNote}
                        </blockquote>
                    )}

                    <Button
                        type="button"
                        onClick={() => navigate("/profile-setup")}
                    >
                        Update my profile
                    </Button>
                </ProfileStatusCard>
            </AppLayout>
        );
    }

    // =========================================================
    // Initial Profile Rejected
    // =========================================================

    if (profileStatus === "rejected") {
        return (
            <AppLayout>
                <ProfileStatusCard
                    variant="rejected"
                    title="Profile not approved"
                >
                    <p>
                        Your profile could not be approved. Please contact our
                        support team if you believe this decision needs clarification.
                    </p>

                    {profile?.reviewNote && (
                        <blockquote className="profile-status-note">
                            <span>Note from our team</span>
                            {profile.reviewNote}
                        </blockquote>
                    )}

                    <Button
                        type="button"
                        onClick={() => navigate("/support")}
                    >
                        Contact support
                    </Button>
                </ProfileStatusCard>
            </AppLayout>
        );
    }

    // =========================================================
    // Approved Profile — Revision Pending Review
    // =========================================================

    if (
        profileStatus === "approved" &&
        revisionStatus === "pending_review"
    ) {
        return (
            <AppLayout>
                <ProfileStatusCard
                    variant="pending"
                    title="Your profile changes are under review"
                >
                    <p>
                        Your original approved profile remains active and visible
                        while our team reviews your latest changes.
                    </p>

                    {revision?.submittedAt && (
                        <p className="profile-status-meta">
                            Changes submitted on{" "}
                            {new Date(revision.submittedAt).toLocaleDateString()}
                        </p>
                    )}

                    <ol className="profile-status-track" aria-label="Revision review progress">
                        <li className="is-done">Changes submitted</li>
                        <li className="is-current">Review by our team</li>
                        <li>Changes approved</li>
                    </ol>

                    <Button
                        type="button"
                        onClick={refreshRevision}
                        isLoading={isRevisionLoading}
                        loadingText="Checking..."
                    >
                        Refresh revision status
                    </Button>

                    <Button
                        type="button"
                        variant="secondary"
                        onClick={() => navigate("/my-profile")}
                    >
                        View approved profile
                    </Button>
                </ProfileStatusCard>
            </AppLayout>
        );
    }

    // =========================================================
    // Approved Profile — Revision Needs Changes
    // =========================================================

    if (
        profileStatus === "approved" &&
        revisionStatus === "needs_changes"
    ) {
        return (
            <AppLayout>
                <ProfileStatusCard
                    variant="needs-changes"
                    title="Changes requested for your profile"
                >
                    <p>
                        Your existing approved profile is still active.
                        Our team has requested some changes to your proposed update.
                    </p>

                    {revision?.reviewNote && (
                        <blockquote className="profile-status-note">
                            <span>Note from our team</span>
                            {revision.reviewNote}
                        </blockquote>
                    )}

                    <Button
                        type="button"
                        onClick={() => navigate("/profile-setup?mode=edit")}
                    >
                        Update my changes
                    </Button>

                    <Button
                        type="button"
                        variant="secondary"
                        onClick={() => navigate("/my-profile")}
                    >
                        View approved profile
                    </Button>
                </ProfileStatusCard>
            </AppLayout>
        );
    }

    // =========================================================
    // Approved Profile — Revision Draft
    // =========================================================

    if (
        profileStatus === "approved" &&
        revisionStatus === "draft"
    ) {
        return (
            <AppLayout>
                <ProfileStatusCard
                    variant="approved"
                    title="Your approved profile is active"
                >
                    <p>
                        You have an unfinished profile update.
                        Continue editing whenever you're ready.
                    </p>

                    <Button
                        type="button"
                        onClick={() => navigate("/profile-setup?mode=edit")}
                    >
                        Continue editing
                    </Button>

                    <Button
                        type="button"
                        variant="secondary"
                        onClick={() => navigate("/my-profile")}
                    >
                        View My Profile
                    </Button>
                </ProfileStatusCard>
            </AppLayout>
        );
    }

    // =========================================================
    // Approved Profile — No Pending Revision
    // =========================================================

    if (profileStatus === "approved") {
        return (
            <AppLayout>
                <ProfileStatusCard
                    variant="approved"
                    title="Your profile has been approved!"
                >
                    <p>
                        Congratulations! Your matrimony profile has been
                        successfully reviewed and approved by our team.
                    </p>

                    <p>
                        Your profile is now eligible to be visible to other
                        members of GenZ Matrimony.
                    </p>

                    <Button
                        type="button"
                        onClick={() => navigate("/my-profile")}
                    >
                        View My Profile
                    </Button>
                </ProfileStatusCard>
            </AppLayout>
        );
    }

    return null;
}
