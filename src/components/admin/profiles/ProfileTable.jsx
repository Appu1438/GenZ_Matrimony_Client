import {
    Users,
    MapPin,
    ClipboardCheck,
    Eye,
    ChevronLeft,
    ChevronRight,
    CalendarDays,
} from "lucide-react";

import ProfileStatusBadge from "./ProfileStatusBadge";
import {
    formatDate,
    getAge,
    clampPercent,
    completionTone,
    joinPlace,
} from "../../../utils/admin/profileUtils.js";

const DEFAULT_LIMIT = 20;

// Normalise one API profile into the values both layouts need.
const toRow = (profile) => {
    const user = profile.user || {};
    const name =
        profile.basic?.fullName || user.fullName || "Unnamed profile";

    return {
        id: profile._id,
        memberId:
            user._id ||
            (typeof profile.user === "string" ? profile.user : null),
        name,
        email: user.email || "—",
        photo: profile.photos?.profilePhoto?.url,
        gender: profile.basic?.gender || "",
        age: getAge(profile.basic?.dateOfBirth),
        place: joinPlace(profile.location?.city, profile.location?.state),
        completion: clampPercent(profile.completionPercentage),
        status: profile.status,
        submitted: formatDate(profile.submittedAt || profile.createdAt),
    };
};

const Avatar = ({ photo, name }) => (
    <span className="ad-avatar pf-avatar">
        {photo ? (
            <img src={photo} alt="" loading="lazy" />
        ) : (
            name.charAt(0).toUpperCase()
        )}
    </span>
);

const Completion = ({ value }) => (
    <div
        className={`pf-completion pf-completion--${completionTone(value)}`}
        title={`${value}% complete`}
    >
        <i>
            <b style={{ width: `${value}%` }} />
        </i>
        <span className="ad-num">{value}%</span>
    </div>
);

const RowActions = ({ row, onReview, onViewMember }) => (
    <div className="ad-row-actions">
        <button
            type="button"
            className={`ad-btn pf-review-btn ${
                row.status === "pending_review"
                    ? "ad-btn--primary"
                    : "ad-btn--ghost"
            }`}
            onClick={() => onReview(row.id)}
        >
            <ClipboardCheck size={15} />
            Review
        </button>

        {row.status === "approved" && row.memberId && (
            <button
                type="button"
                className="ad-icon-btn"
                title="View member"
                aria-label={`View member ${row.name}`}
                onClick={() => onViewMember(row.memberId)}
            >
                <Eye size={16} />
            </button>
        )}
    </div>
);

const ProfileTable = ({
    profiles = [],
    loading = false,
    page = 1,
    pagination = {},
    onReview,
    onPageChange,
    onViewMember,
}) => {
    const limit = Number(pagination.limit || DEFAULT_LIMIT);
    const total = Number(pagination.total || 0);
    const pages = Number(pagination.pages || 0);

    const startItem = profiles.length ? (page - 1) * limit + 1 : 0;
    const endItem = Math.min(page * limit, total);

    const rows = profiles.map(toRow);
    const showSkeleton = loading && rows.length === 0;
    const showEmpty = !loading && rows.length === 0;

    const empty = (
        <div className="ad-empty">
            <Users size={30} />
            <strong>No profiles found</strong>
            <span>Try changing your search or filters.</span>
        </div>
    );

    return (
        <>
            {/* DESKTOP / TABLET TABLE */}
            <div className="ad-table-wrap pf-table-wrap">
                <table className="ad-table pf-table">
                    <thead>
                        <tr>
                            <th>Profile</th>
                            <th>Gender / age</th>
                            <th>Location</th>
                            <th>Completion</th>
                            <th>Status</th>
                            <th>Submitted</th>
                            <th>
                                <span className="pf-sr">Actions</span>
                            </th>
                        </tr>
                    </thead>

                    <tbody>
                        {showSkeleton ? (
                            Array.from({ length: 6 }, (_, i) => (
                                <tr key={i} aria-hidden="true">
                                    {Array.from({ length: 7 }, (_, c) => (
                                        <td key={c}>
                                            <span
                                                className="ad-skeleton"
                                                style={{ width: c === 0 ? "70%" : "55%" }}
                                            />
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : showEmpty ? (
                            <tr>
                                <td colSpan="7">{empty}</td>
                            </tr>
                        ) : (
                            rows.map((row) => (
                                <tr
                                    key={row.id}
                                    className={loading ? "is-refreshing" : ""}
                                >
                                    <td>
                                        <div className="ad-user">
                                            <Avatar photo={row.photo} name={row.name} />
                                            <div>
                                                <strong>{row.name}</strong>
                                                <span className="ad-user__meta">
                                                    {row.email}
                                                </span>
                                            </div>
                                        </div>
                                    </td>

                                    <td>
                                        <strong className="pf-capital">
                                            {row.gender || "—"}
                                        </strong>
                                        <span className="ad-user__meta">{row.age}</span>
                                    </td>

                                    <td className="ad-muted">
                                        <span className="pf-location">
                                            <MapPin size={14} />
                                            {row.place || "—"}
                                        </span>
                                    </td>

                                    <td>
                                        <Completion value={row.completion} />
                                    </td>

                                    <td>
                                        <ProfileStatusBadge status={row.status} />
                                    </td>

                                    <td className="ad-muted ad-num">{row.submitted}</td>

                                    <td>
                                        <RowActions
                                            row={row}
                                            onReview={onReview}
                                            onViewMember={onViewMember}
                                        />
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* MOBILE CARDS */}
            <div className="pf-cards">
                {showSkeleton ? (
                    Array.from({ length: 4 }, (_, i) => (
                        <div className="pf-card" key={i} aria-hidden="true">
                            <span className="ad-skeleton" style={{ width: "60%" }} />
                            <span className="ad-skeleton" style={{ width: "40%" }} />
                            <span className="ad-skeleton" style={{ width: "80%" }} />
                        </div>
                    ))
                ) : showEmpty ? (
                    empty
                ) : (
                    rows.map((row) => (
                        <article
                            key={row.id}
                            className={`pf-card ${loading ? "is-refreshing" : ""}`}
                        >
                            <div className="pf-card-top">
                                <div className="ad-user">
                                    <Avatar photo={row.photo} name={row.name} />
                                    <div>
                                        <strong>{row.name}</strong>
                                        <span className="ad-user__meta">{row.email}</span>
                                    </div>
                                </div>

                                <ProfileStatusBadge status={row.status} />
                            </div>

                            <div className="pf-card-facts">
                                <span className="pf-pill pf-capital-inline">
                                    {[row.gender, row.age !== "—" ? row.age : ""]
                                        .filter(Boolean)
                                        .join(" · ") || "—"}
                                </span>

                                {row.place && (
                                    <span className="pf-pill">
                                        <MapPin size={12} />
                                        {row.place}
                                    </span>
                                )}
                            </div>

                            <Completion value={row.completion} />

                            <div className="pf-card-foot">
                                <span className="pf-card-date">
                                    <CalendarDays size={14} />
                                    {row.submitted}
                                </span>

                                <RowActions
                                    row={row}
                                    onReview={onReview}
                                    onViewMember={onViewMember}
                                />
                            </div>
                        </article>
                    ))
                )}
            </div>

            {/* PAGINATION */}
            <div className="ad-pagination">
                <div className="ad-pagination__info">
                    Showing <strong>{startItem}–{endItem}</strong> of{" "}
                    <strong>{total}</strong>
                </div>

                <div className="ad-pagination__controls">
                    <button
                        type="button"
                        aria-label="Previous page"
                        disabled={page <= 1 || loading}
                        onClick={() => onPageChange(page - 1)}
                    >
                        <ChevronLeft size={17} />
                    </button>

                    <span>
                        Page <strong>{pages ? page : 0}</strong> of{" "}
                        <strong>{pages}</strong>
                    </span>

                    <button
                        type="button"
                        aria-label="Next page"
                        disabled={page >= pages || loading}
                        onClick={() => onPageChange(page + 1)}
                    >
                        <ChevronRight size={17} />
                    </button>
                </div>
            </div>
        </>
    );
};

export default ProfileTable;