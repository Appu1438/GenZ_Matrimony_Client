
import { Search, RotateCcw, X, Users, Clock, CheckCircle2, AlertCircle, XCircle, FileEdit } from "lucide-react";

const STATUS_TABS = [
    { value: "all", label: "All profiles", key: "total", icon: Users },
    { value: "pending_review", label: "Pending", key: "pending_review", icon: Clock },
    { value: "approved", label: "Approved", key: "approved", icon: CheckCircle2 },
    { value: "needs_changes", label: "Needs changes", key: "needs_changes", icon: AlertCircle },
    { value: "rejected", label: "Rejected", key: "rejected", icon: XCircle },
    { value: "draft", label: "Draft", key: "draft", icon: FileEdit },
];

const ProfileFilters = ({
    search = "",
    status = "all",
    counts = {},
    onSearchChange,
    onStatusChange,
    onReset,
}) => {
    const hasFilters = search.trim().length > 0 || status !== "all";

    return (
        <div className="pf-filter-panel">
            <div className="pf-filter-toolbar">
                <label className="pf-search-box">
                    <Search size={18} />

                    <input
                        type="search"
                        placeholder="Search profiles by name, email or mobile..."
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                    />

                    {search && (
                        <button
                            type="button"
                            className="pf-search-clear"
                            onClick={() => onSearchChange("")}
                            aria-label="Clear search"
                        >
                            <X size={16} />
                        </button>
                    )}
                </label>

                {hasFilters && (
                    <button
                        type="button"
                        className="pf-reset-button"
                        onClick={onReset}
                    >
                        <RotateCcw size={14} />
                        Reset filters
                    </button>
                )}
            </div>

            <div className="pf-status-area">
                <div className="pf-status-heading">
                    <span>Filter by status</span>
                    <span className="pf-status-total">
                        {Number(counts.total ?? 0).toLocaleString("en-IN")} profiles
                    </span>
                </div>

                <div className="pf-status-list">
                    {STATUS_TABS.map(({ value, label, key, icon: Icon }) => {
                        const count = Number(counts[key] ?? 0);
                        const active = status === value;

                        return (
                            <button
                                key={value}
                                type="button"
                                className={`pf-status-button ${
                                    active ? "is-active" : ""
                                } ${value === "pending_review" && count > 0 ? "has-pending" : ""}`}
                                aria-pressed={active}
                                onClick={() => onStatusChange(value)}
                            >
                                <Icon size={15} />
                                <span className="pf-status-label">{label}</span>
                                <span className="pf-status-count">
                                    {count.toLocaleString("en-IN")}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default ProfileFilters;
