import { Mail, Phone, ShieldCheck, ShieldAlert, UserRound, Eye, ArrowUpDown } from "lucide-react";
import { useNavigate } from "react-router-dom";

const STATUS_TONE = { active: "success", suspended: "warning", banned: "danger" };

const formatDate = (date) =>
    date
        ? new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(date))
        : "—";

const SkeletonRows = () =>
    Array.from({ length: 6 }, (_, i) => (
        <tr key={i} aria-hidden="true">
            {[0, 1, 2, 3, 4, 5].map((c) => (
                <td key={c}><span className="ad-skeleton" style={{ width: c === 0 ? "70%" : "55%" }} /></td>
            ))}
        </tr>
    ));

const UserTable = ({ users, loading, updatingId, sortOrder, onSort, onStatusChange }) => {
    const navigate = useNavigate();

    return (
        <div className="ad-table-wrap">
            <table className="ad-table ad-table--stack">
                <thead>
                    <tr>
                        <th>User</th>
                        <th>Contact</th>
                        <th>Email</th>
                        <th>Status</th>
                        <th aria-sort={sortOrder === "newest" ? "descending" : "ascending"}>
                            <button type="button" className="ad-sort" onClick={onSort}>
                                Registered <ArrowUpDown size={13} />
                                <span className="visually-hidden">
                                    , sorted {sortOrder === "newest" ? "newest first" : "oldest first"}
                                </span>
                            </button>
                        </th>
                        <th>Actions</th>
                    </tr>
                </thead>

                <tbody>
                    {loading && users.length === 0 ? (
                        <SkeletonRows />
                    ) : users.length === 0 ? (
                        <tr>
                            <td colSpan="6">
                                <div className="ad-empty">
                                    <UserRound size={30} />
                                    <strong>No users found</strong>
                                    <span>Try changing your search or filters.</span>
                                </div>
                            </td>
                        </tr>
                    ) : (
                        users.map((user) => (
                            <tr key={user._id} className={loading ? "is-refreshing" : ""}>
                                <td data-label="User">
                                    <div className="ad-user">
                                        <span className="ad-avatar">
                                            {user.fullName?.charAt(0)?.toUpperCase() || "U"}
                                        </span>
                                        <div>
                                            <strong>{user.fullName}</strong>
                                            <span className="ad-user__meta">ID {user._id.slice(-8).toUpperCase()}</span>
                                        </div>
                                    </div>
                                </td>

                                <td data-label="Contact">
                                    <div className="ad-contact">
                                        <span><Mail size={13} /> {user.email}</span>
                                        <span><Phone size={13} /> {user.mobile}</span>
                                    </div>
                                </td>

                                <td data-label="Email">
                                    {user.isEmailVerified ? (
                                        <span className="ad-badge ad-badge--icon ad-badge--success"><ShieldCheck size={13} /> Verified</span>
                                    ) : (
                                        <span className="ad-badge ad-badge--icon ad-badge--warning"><ShieldAlert size={13} /> Unverified</span>
                                    )}
                                </td>

                                <td data-label="Status">
                                    <span className={`ad-badge ad-badge--${STATUS_TONE[user.accountStatus] || "info"}`}>
                                        {user.accountStatus}
                                    </span>
                                </td>

                                <td data-label="Registered" className="ad-muted ad-num">{formatDate(user.createdAt)}</td>

                                <td data-label="Actions">
                                    <div className="ad-row-actions">
                                        <button
                                            type="button"
                                            className="ad-icon-btn"
                                            title="View user"
                                            aria-label={`View ${user.fullName}`}
                                            onClick={() => navigate(`/admin/users/${user._id}`)}
                                        >
                                            <Eye size={16} />
                                        </button>

                                        <select
                                            className="ad-select ad-select--sm"
                                            aria-label={`Change status for ${user.fullName}`}
                                            value={user.accountStatus}
                                            disabled={updatingId === user._id}
                                            onChange={(e) => onStatusChange(user, e.target.value)}
                                        >
                                            <option value="active">Active</option>
                                            <option value="suspended">Suspend</option>
                                            <option value="banned">Ban</option>
                                        </select>
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default UserTable;