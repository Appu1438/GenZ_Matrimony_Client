import { useCallback, useEffect, useRef, useState } from "react";
import { UsersRound, RefreshCw, Download, ChevronLeft, ChevronRight, TriangleAlert, Check } from "lucide-react";

import adminUserService from "../../../services/admin/adminUserService.js";
import UserStats from "../../../components/admin/users/UserStats";
import UserFilters from "../../../components/admin/users/UserFilters";
import UserTable from "../../../components/admin/users/UserTable";

import "./Users.css";
import AdminLayout from "../../../components/admin/layout/AdminLayout.jsx";

// Note: no <AdminLayout> wrapper here. AdminLayout renders <Outlet />, so this page
// is mounted by the router inside it.

const INITIAL_FILTERS = { search: "", status: "all", verification: "all", from: "", to: "" };
const PAGE_SIZES = [10, 20, 50];

const Users = () => {
    const [users, setUsers] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [statsLoading, setStatsLoading] = useState(true);
    const [error, setError] = useState("");
    const [filters, setFilters] = useState(INITIAL_FILTERS);
    const [sortOrder, setSortOrder] = useState("newest");
    const [updatingId, setUpdatingId] = useState(null);
    const [pendingChange, setPendingChange] = useState(null);
    const [toast, setToast] = useState(null);
    const toastTimer = useRef(null);

    const [pagination, setPagination] = useState({
        currentPage: 1, limit: 20, totalUsers: 0, totalPages: 0, hasNextPage: false, hasPrevPage: false,
    });

    const flash = useCallback((message, tone = "ok") => {
        setToast({ message, tone });
        clearTimeout(toastTimer.current);
        toastTimer.current = setTimeout(() => setToast(null), 2600);
    }, []);
    useEffect(() => () => clearTimeout(toastTimer.current), []);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const response = await adminUserService.getUsers({
                page: pagination.currentPage,
                limit: pagination.limit,
                search: filters.search.trim(),
                status: filters.status,
                verification: filters.verification,
                from: filters.from,
                to: filters.to,
                sort: sortOrder,
            });
            setUsers(response.data.users || []);
            setPagination((prev) => ({ ...prev, ...response.data.pagination }));
        } catch (err) {
            console.error("Fetch users error:", err);
            setError(err.response?.data?.message || "Unable to load users. Please try again.");
        } finally {
            setLoading(false);
        }
    }, [pagination.currentPage, pagination.limit, filters, sortOrder]);

    const fetchStats = useCallback(async () => {
        setStatsLoading(true);
        try {
            const response = await adminUserService.getStats();
            setStats(response.data);
        } catch (err) {
            console.error("Fetch user stats error:", err);
        } finally {
            setStatsLoading(false);
        }
    }, []);

    useEffect(() => {
        const timer = setTimeout(fetchUsers, 350);
        return () => clearTimeout(timer);
    }, [fetchUsers]);

    useEffect(() => { fetchStats(); }, [fetchStats]);

    const goToFirstPage = () => setPagination((prev) => ({ ...prev, currentPage: 1 }));

    const handleFilterChange = (name, value) => {
        setFilters((prev) => ({ ...prev, [name]: value }));
        goToFirstPage();
    };

    const handleResetFilters = () => {
        setFilters(INITIAL_FILTERS);
        goToFirstPage();
    };

    // Clicking a stat card applies its preset on top of cleared filters.
    const handleStatSelect = (preset) => {
        setFilters({ ...INITIAL_FILTERS, ...preset });
        goToFirstPage();
    };

    const handlePageChange = (page) => {
        if (page < 1 || page > pagination.totalPages) return;
        setPagination((prev) => ({ ...prev, currentPage: page }));
    };

    const handleLimitChange = (limit) =>
        setPagination((prev) => ({ ...prev, limit: Number(limit), currentPage: 1 }));

    const handleSort = () => {
        setSortOrder((prev) => (prev === "newest" ? "oldest" : "newest"));
        goToFirstPage();
    };

    // Status change: ask first (in-page dialog), then update.
    const requestStatusChange = (user, newStatus) => {
        if (newStatus !== user.accountStatus) setPendingChange({ user, newStatus });
    };

    const confirmStatusChange = async () => {
        const { user, newStatus } = pendingChange;
        setPendingChange(null);
        setUpdatingId(user._id);
        try {
            const response = await adminUserService.updateStatus(user._id, newStatus);
            const updatedUser = response.data.user;
            setUsers((prev) => prev.map((item) => (item._id === user._id ? updatedUser : item)));
            flash(`${user.fullName} is now ${newStatus}.`);
            fetchStats();
        } catch (err) {
            console.error("Update status error:", err);
            flash(err.response?.data?.message || "Unable to update account status.", "error");
        } finally {
            setUpdatingId(null);
        }
    };

    useEffect(() => {
        if (!pendingChange) return undefined;
        const onKey = (event) => event.key === "Escape" && setPendingChange(null);
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [pendingChange]);

    const handleExport = () => {
        if (!users.length) return;
        const headers = ["Full Name", "Email", "Mobile", "Email Verified", "Account Status", "Registered"];
        const rows = users.map((u) => [
            u.fullName, u.email, u.mobile, u.isEmailVerified ? "Yes" : "No", u.accountStatus, u.createdAt,
        ]);
        const escapeCsv = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;
        const csv = [headers, ...rows].map((row) => row.map(escapeCsv).join(",")).join("\r\n");

        const url = URL.createObjectURL(new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" }));
        const link = document.createElement("a");
        link.href = url;
        link.download = "genz-users.csv";
        link.click();
        URL.revokeObjectURL(url);
    };

    const startItem = pagination.totalUsers === 0 ? 0 : (pagination.currentPage - 1) * pagination.limit + 1;
    const endItem = Math.min(pagination.currentPage * pagination.limit, pagination.totalUsers);
    const severe = pendingChange && pendingChange.newStatus !== "active";

    return (
        <AdminLayout>

            <div className="admin-users-page">
                <header className="users-page-header">
                    <div className="users-page-heading">
                        <span className="users-heading-icon"><UsersRound size={22} /></span>
                        <div>
                            <h1>User management</h1>
                            <p>Review registered members and manage their accounts.</p>
                        </div>
                    </div>

                    <div className="users-header-actions">
                        <button type="button" className="users-refresh-button" disabled={loading}
                            onClick={() => { fetchUsers(); fetchStats(); }}>
                            <RefreshCw size={16} className={loading ? "refresh-spinning" : ""} /> Refresh
                        </button>
                        <button type="button" className="users-export-button" onClick={handleExport} disabled={!users.length}>
                            <Download size={16} /> Export CSV
                        </button>
                    </div>
                </header>

                <UserStats stats={stats} loading={statsLoading} filters={filters} onSelect={handleStatSelect} />

                <section className="users-list-section">
                    <div className="users-list-header">
                        <div>
                            <h2>All users</h2>
                            <p>Browse and manage every registered account.</p>
                        </div>
                        <span className="users-total-count">
                            {pagination.totalUsers.toLocaleString("en-IN")} users
                        </span>
                    </div>

                    <UserFilters filters={filters} onChange={handleFilterChange} onReset={handleResetFilters} />

                    {error && (
                        <div className="users-error" role="alert">
                            <span>{error}</span>
                            <button type="button" onClick={fetchUsers}>Try again</button>
                        </div>
                    )}

                    <UserTable
                        users={users}
                        loading={loading}
                        updatingId={updatingId}
                        sortOrder={sortOrder}
                        onSort={handleSort}
                        onStatusChange={requestStatusChange}
                    />

                    <div className="users-pagination">
                        <div className="users-pagination-info">
                            Showing <strong>{startItem}–{endItem}</strong> of <strong>{pagination.totalUsers}</strong>
                            <select className="user-select" value={pagination.limit}
                                onChange={(e) => handleLimitChange(e.target.value)} aria-label="Rows per page">
                                {PAGE_SIZES.map((size) => <option key={size} value={size}>{size} per page</option>)}
                            </select>
                        </div>

                        <div className="users-pagination-controls">
                            <button type="button" aria-label="Previous page" disabled={!pagination.hasPrevPage || loading}
                                onClick={() => handlePageChange(pagination.currentPage - 1)}>
                                <ChevronLeft size={17} />
                            </button>
                            <span>
                                Page <strong>{pagination.currentPage}</strong> of{" "}
                                <strong>{Math.max(1, pagination.totalPages)}</strong>
                            </span>
                            <button type="button" aria-label="Next page" disabled={!pagination.hasNextPage || loading}
                                onClick={() => handlePageChange(pagination.currentPage + 1)}>
                                <ChevronRight size={17} />
                            </button>
                        </div>
                    </div>
                </section>

                {pendingChange && (
                    <div className="users-backdrop" role="presentation"
                        onMouseDown={(e) => e.target === e.currentTarget && setPendingChange(null)}>
                        <div className="users-dialog" role="dialog" aria-modal="true" aria-labelledby="status-dialog-title">
                            <span className={`users-dialog-icon ${severe ? "is-danger" : ""}`}><TriangleAlert size={22} /></span>
                            <h2 id="status-dialog-title">Change account status?</h2>
                            <p>
                                {pendingChange.user.fullName}'s account will be set to{" "}
                                <strong>{pendingChange.newStatus}</strong>.
                                {severe && " They may lose access to GenZ Matrimony until it is reactivated."}
                            </p>
                            <div className="users-dialog-actions">
                                <button type="button" className="users-cancel" onClick={() => setPendingChange(null)}>Cancel</button>
                                <button type="button" className={`users-confirm ${severe ? "is-danger" : ""}`}
                                    onClick={confirmStatusChange}>
                                    Confirm
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {toast && (
                    <div className={`users-toast ${toast.tone === "error" ? "is-error" : ""}`} role="status" aria-live="polite">
                        {toast.tone === "error" ? <TriangleAlert size={15} /> : <Check size={15} />} {toast.message}
                    </div>
                )}
            </div>

        </AdminLayout>

    );
};

export default Users;