import { Search, X, RotateCcw } from "lucide-react";

const STATUS_TABS = [
    ["all", "All"],
    ["active", "Active"],
    ["suspended", "Suspended"],
    ["banned", "Banned"],
];

const UserFilters = ({ filters, onChange, onReset }) => {
    const hasFilters =
        filters.search ||
        filters.status !== "all" ||
        filters.verification !== "all" ||
        filters.from ||
        filters.to;

    return (
        <div className="ad-filters">
            <div className="ad-filters__row ad-filters__row--split">
                <label className="ad-search">
                    <Search size={17} />
                    <input
                        type="search"
                        placeholder="Search name, email or mobile"
                        value={filters.search}
                        onChange={(e) => onChange("search", e.target.value)}
                    />
                    {filters.search && (
                        <button type="button" onClick={() => onChange("search", "")} aria-label="Clear search">
                            <X size={15} />
                        </button>
                    )}
                </label>

                <div className="ad-tabs" role="radiogroup" aria-label="Account status">
                    {STATUS_TABS.map(([value, label]) => (
                        <button
                            key={value}
                            type="button"
                            role="radio"
                            aria-checked={filters.status === value}
                            className={filters.status === value ? "is-selected" : ""}
                            onClick={() => onChange("status", value)}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="ad-filters__row">
                <select
                    className="ad-select"
                    value={filters.verification}
                    onChange={(e) => onChange("verification", e.target.value)}
                    aria-label="Email verification"
                >
                    <option value="all">All emails</option>
                    <option value="verified">Verified</option>
                    <option value="unverified">Unverified</option>
                </select>

                <div className="ad-date">
                    <label htmlFor="user-from">From</label>
                    <input id="user-from" type="date" value={filters.from}
                        onChange={(e) => onChange("from", e.target.value)} />
                </div>

                <div className="ad-date">
                    <label htmlFor="user-to">To</label>
                    <input id="user-to" type="date" value={filters.to} min={filters.from || undefined}
                        onChange={(e) => onChange("to", e.target.value)} />
                </div>

                <button type="button" className="ad-link-btn" onClick={onReset} disabled={!hasFilters}>
                    <RotateCcw size={14} /> Reset
                </button>
            </div>
        </div>
    );
};

export default UserFilters;