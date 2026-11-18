import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ClipboardCheck, Clock, RefreshCw } from "lucide-react";

import adminProfileService from "../../../services/admin/adminProfileService.js";

import AdminLayout from "../../../components/admin/layout/AdminLayout.jsx";
import ProfileStats from "../../../components/admin/profiles/ProfileStats.jsx";
import ProfileFilters from "../../../components/admin/profiles/ProfileFilters.jsx";
import ProfileTable from "../../../components/admin/profiles/ProfileTable.jsx";
import ProfileReviewModal from "../../../components/admin/profiles/ProfileReviewModal.jsx";

import "./Profiles.css";

const LIMIT = 20;

const LIST_TITLES = {
    all: "All Profiles",
    pending_review: "Pending Review",
    approved: "Approved Profiles",
    needs_changes: "Needs Changes",
    rejected: "Rejected Profiles",
    draft: "Draft Profiles",
};

const Profiles = () => {
    const navigate = useNavigate();

    // Listing
    const [profiles, setProfiles] = useState([]);
    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Filters and pagination
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("all");
    const [page, setPage] = useState(1);

    const [pagination, setPagination] = useState({
        page: 1,
        pages: 1,
        total: 0,
        limit: LIMIT,
    });

    // Review modal
    const [selectedProfile, setSelectedProfile] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);

    const [reviewAction, setReviewAction] = useState("");
    const [reviewNote, setReviewNote] = useState("");
    const [reviewLoading, setReviewLoading] = useState(false);
    const [reviewError, setReviewError] = useState("");

    // =========================================
    // FETCH STATISTICS
    // =========================================

    const fetchStats = useCallback(async () => {
        try {
            const response = await adminProfileService.getStats();
            setStats(response.data.data || {});
        } catch (err) {
            console.error("Failed to load profile statistics:", err);
        }
    }, []);

    // =========================================
    // FETCH PROFILES
    // =========================================

    const fetchProfiles = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const response = await adminProfileService.getProfiles({
                page,
                limit: LIMIT,
                search: search.trim(),
                status,
            });

            const data = response.data.data;

            setProfiles(data.profiles || []);
            setPagination(
                data.pagination || {
                    page: 1,
                    pages: 1,
                    total: 0,
                    limit: LIMIT,
                }
            );
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to load profiles. Please try again."
            );
        } finally {
            setLoading(false);
        }
    }, [page, search, status]);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchProfiles();
        }, 300);

        return () => clearTimeout(timer);
    }, [fetchProfiles]);

    // =========================================
    // FILTER HANDLERS
    // =========================================

    const handleSearchChange = (value) => {
        setSearch(value);
        setPage(1);
    };

    const handleStatusChange = (value) => {
        setStatus(value);
        setPage(1);
    };

    const resetFilters = () => {
        setSearch("");
        setStatus("all");
        setPage(1);
    };

    // =========================================
    // MODAL
    // =========================================

    const closeProfile = useCallback(() => {
        if (reviewLoading) return;

        setSelectedProfile(null);
        setDetailLoading(false);
        setReviewAction("");
        setReviewNote("");
        setReviewError("");
    }, [reviewLoading]);

    const openProfile = async (id) => {
        try {
            setDetailLoading(true);
            setSelectedProfile(null);

            setReviewAction("");
            setReviewNote("");
            setReviewError("");

            const response = await adminProfileService.getProfile(id);

            setSelectedProfile(response.data.data.profile);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to load profile details."
            );
        } finally {
            setDetailLoading(false);
        }
    };

    const modalOpen = Boolean(selectedProfile || detailLoading);

    // Close on Escape
    useEffect(() => {
        if (!modalOpen) return undefined;

        const handleEscape = (event) => {
            if (event.key === "Escape" && !reviewLoading) {
                closeProfile();
            }
        };

        window.addEventListener("keydown", handleEscape);

        return () => {
            window.removeEventListener("keydown", handleEscape);
        };
    }, [modalOpen, reviewLoading, closeProfile]);

    // Stop the page behind the modal from scrolling
    useEffect(() => {
        if (!modalOpen) return undefined;

        const previous = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        return () => {
            document.body.style.overflow = previous;
        };
    }, [modalOpen]);

    // =========================================
    // REVIEW ACTIONS
    // =========================================

    const handleActionChange = (action) => {
        setReviewAction(action);
        setReviewError("");
    };

    const handleNoteChange = (value) => {
        setReviewNote(value);
        setReviewError("");
    };

    const submitReview = async () => {
        if (!selectedProfile || !reviewAction || reviewLoading) return;

        if (reviewAction !== "approve" && !reviewNote.trim()) {
            setReviewError("Please enter remarks before continuing.");
            return;
        }

        try {
            setReviewLoading(true);
            setReviewError("");

            await adminProfileService.reviewProfile(selectedProfile._id, {
                action: reviewAction,
                note: reviewNote.trim(),
            });

            // Close the modal and reset review fields.
            setSelectedProfile(null);
            setReviewAction("");
            setReviewNote("");

            // Refresh both the listing and the statistics.
            await Promise.all([fetchProfiles(), fetchStats()]);
        } catch (err) {
            setReviewError(
                err.response?.data?.message ||
                "Unable to update profile status."
            );
        } finally {
            setReviewLoading(false);
        }
    };

    const pendingCount = Number(stats.pending_review || 0);
    const goToMember = (memberId) => navigate(`/admin/users/${memberId}`);

    // =========================================
    // RENDER
    // =========================================

    return (
        <AdminLayout>
            <div className="ad-page">
                {/* PAGE HEADER */}
                <header className="ad-page-header">
                    <div className="ad-page-title">
                        <span className="ad-page-icon">
                            <ClipboardCheck size={22} />
                        </span>

                        <div>
                            <h1>Profiles</h1>
                            <p>Review and manage member matrimony profiles.</p>
                        </div>
                    </div>

                    <div className="ad-page-actions">
                        <button
                            type="button"
                            className="ad-btn ad-btn--ghost"
                            disabled={loading}
                            onClick={() => {
                                fetchProfiles();
                                fetchStats();
                            }}
                        >
                            <RefreshCw
                                size={16}
                                className={loading ? "ad-spin" : ""}
                            />
                            Refresh
                        </button>
                    </div>
                </header>

                {/* WAITING-FOR-REVIEW CALLOUT */}
                {pendingCount > 0 && status !== "pending_review" && (
                    <div className="pf-callout" role="status">
                        <span className="pf-callout-icon">
                            <Clock size={18} />
                        </span>

                        <p>
                            <strong>
                                {pendingCount.toLocaleString("en-IN")}{" "}
                                {pendingCount === 1 ? "profile is" : "profiles are"}
                            </strong>{" "}
                            waiting for review.
                        </p>

                        <button
                            type="button"
                            className="ad-btn ad-btn--primary pf-callout-btn"
                            onClick={() => handleStatusChange("pending_review")}
                        >
                            Start reviewing
                        </button>
                    </div>
                )}

                {/* STATISTICS */}
                <ProfileStats
                    stats={stats}
                    activeStatus={status}
                    onStatusChange={handleStatusChange}
                />

                {/* LISTING CARD */}
                <section className="ad-card pf-list-card">
                    <div className="ad-card-head">
                        <div>
                            <h2>{LIST_TITLES[status] || "Profiles"}</h2>
                            <p>Member profile records and review status.</p>
                        </div>

                        <span className="ad-count">
                            {Number(pagination.total || 0).toLocaleString("en-IN")}{" "}
                            profiles
                        </span>
                    </div>

                    <ProfileFilters
                        search={search}
                        status={status}
                        counts={stats}
                        onSearchChange={handleSearchChange}
                        onStatusChange={handleStatusChange}
                        onReset={resetFilters}
                    />

                    {error && (
                        <div className="ad-alert" role="alert">
                            <span>{error}</span>
                            <button type="button" onClick={fetchProfiles}>
                                Try again
                            </button>
                        </div>
                    )}

                    <ProfileTable
                        profiles={profiles}
                        loading={loading}
                        page={page}
                        pagination={pagination}
                        onReview={openProfile}
                        onPageChange={setPage}
                        onViewMember={goToMember}
                    />
                </section>

                {/* REVIEW MODAL */}
                {modalOpen && (
                    <ProfileReviewModal
                        profile={selectedProfile}
                        loading={detailLoading}
                        reviewAction={reviewAction}
                        reviewNote={reviewNote}
                        reviewLoading={reviewLoading}
                        reviewError={reviewError}
                        onClose={closeProfile}
                        onActionChange={handleActionChange}
                        onNoteChange={handleNoteChange}
                        onSubmit={submitReview}
                        onViewMember={goToMember}
                    />
                )}
            </div>
        </AdminLayout>
    );
};

export default Profiles;