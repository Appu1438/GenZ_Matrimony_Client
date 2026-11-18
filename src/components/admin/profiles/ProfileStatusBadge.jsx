
const STATUS = {
    draft: { label: "Draft", tone: "violet" },
    pending_review: { label: "Pending review", tone: "warning" },
    needs_changes: { label: "Needs changes", tone: "info" },
    approved: { label: "Approved", tone: "success" },
    rejected: { label: "Rejected", tone: "danger" },
};

const ProfileStatusBadge = ({ status }) => {
    const info = STATUS[status] || {
        label: status || "Unknown",
        tone: "info",
    };

    return (
        <span className={`ad-badge ad-badge--${info.tone}`}>
            {info.label}
        </span>
    );
};

export default ProfileStatusBadge;
