import {
    Users,
    Clock,
    CheckCircle,
    AlertCircle,
    XCircle,
    FileText,
} from "lucide-react";

const STAT_CARDS = [
    { key: "total", label: "Total Profiles", icon: Users, tone: "blue", status: "all" },
    { key: "pending_review", label: "Pending Review", icon: Clock, tone: "orange", status: "pending_review" },
    { key: "approved", label: "Approved Profiles", icon: CheckCircle, tone: "green", status: "approved" },
    { key: "needs_changes", label: "Needs Changes", icon: AlertCircle, tone: "violet", status: "needs_changes" },
    { key: "rejected", label: "Rejected Profiles", icon: XCircle, tone: "red", status: "rejected" },
    { key: "draft", label: "Draft Profiles", icon: FileText, tone: "grey", status: "draft" },
];

const ProfileStats = ({ stats = {}, activeStatus, onStatusChange }) => {
    return (
        <div className="ad-stats pf-stats">
            {STAT_CARDS.map(({ key, label, icon: Icon, tone, status }) => (
                <button
                    type="button"
                    key={key}
                    className={`ad-stat ${activeStatus === status ? "is-selected" : ""}`}
                    aria-pressed={activeStatus === status}
                    onClick={() => onStatusChange(status)}
                >
                    <span className={`ad-stat__icon tone-${tone}`}>
                        <Icon size={20} strokeWidth={1.8} />
                    </span>

                    <span className="ad-stat__body">
                        <span>{label}</span>
                        <strong>
                            {Number(stats[key] ?? 0).toLocaleString("en-IN")}
                        </strong>
                    </span>
                </button>
            ))}
        </div>
    );
};

export default ProfileStats;