import { Users, UserCheck, UserX, Ban, MailCheck, MailWarning } from "lucide-react";

const CARDS = [
    { key: "totalUsers", title: "Total users", icon: Users, tone: "blue", preset: {} },
    { key: "activeUsers", title: "Active", icon: UserCheck, tone: "green", preset: { status: "active" } },
    { key: "suspendedUsers", title: "Suspended", icon: UserX, tone: "orange", preset: { status: "suspended" } },
    { key: "bannedUsers", title: "Banned", icon: Ban, tone: "red", preset: { status: "banned" } },
    { key: "verifiedUsers", title: "Verified Emails", icon: MailCheck, tone: "violet", preset: { verification: "verified" } },
    { key: "unverifiedUsers", title: "Unverified Emails", icon: MailWarning, tone: "grey", preset: { verification: "unverified" } },
];

// A card is "selected" when the filters match its preset exactly.
const isSelected = (preset, filters) => {
    const status = preset.status || "all";
    const verification = preset.verification || "all";
    return filters.status === status && filters.verification === verification;
};

const UserStats = ({ stats, loading, filters, onSelect }) => (
    <div className="user-stats-grid">
        {CARDS.map(({ key, title, icon: Icon, tone, preset }) => (
            <button
                type="button"
                key={key}
                className={`user-stat-card ${isSelected(preset, filters) ? "is-selected" : ""}`}
                onClick={() => onSelect(preset)}
                aria-pressed={isSelected(preset, filters)}
            >
                <span className={`user-stat-icon tone-${tone}`}>
                    <Icon size={20} strokeWidth={1.8} />
                </span>
                <span className="user-stat-info">
                    <span>{title}</span>
                    <strong className={loading ? "is-loading" : ""}>
                        {loading ? "0000" : Number(stats?.[key] ?? 0).toLocaleString("en-IN")}
                    </strong>
                </span>
            </button>
        ))}
    </div>
);

export default UserStats;