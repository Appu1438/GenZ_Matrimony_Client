import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    ArrowLeft, UserRound, Mail, Phone, CalendarDays, ShieldCheck, ShieldAlert, MapPin,
    GraduationCap, BriefcaseBusiness, Users, Heart, Camera, FileText, RefreshCw,
    AlertCircle, ClipboardCheck, Sparkles, X, ChevronLeft, ChevronRight, ImageOff, Copy, Check,
} from "lucide-react";

import adminUserService from "../../../services/admin/adminUserService.js";
import "./UserView.css";
import AdminLayout from "../../../components/admin/layout/AdminLayout.jsx";

// No <AdminLayout> wrapper: AdminLayout renders <Outlet />, so this page is a child route.
// Styles come from AdminCommon.css (ad-*) plus the page styles in UserView.css (uv-*).

const PROFILE_STATUS = {
    draft: { label: "Draft", tone: "neutral" },
    pending_review: { label: "Pending review", tone: "warning" },
    approved: { label: "Approved", tone: "success" },
    rejected: { label: "Rejected", tone: "danger" },
    not_created: { label: "Not created", tone: "neutral" },
};
const ACCOUNT_TONE = { active: "success", suspended: "warning", banned: "danger" };

const parseDate = (date) => {
    const parsed = date ? new Date(date) : null;
    return parsed && !Number.isNaN(parsed.getTime()) ? parsed : null;
};

const formatDate = (date, withTime = false) => {
    const parsed = parseDate(date);
    if (!parsed) return null;
    return new Intl.DateTimeFormat("en-IN", {
        day: "2-digit", month: "short", year: "numeric",
        ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
    }).format(parsed);
};

const getAge = (date) => {
    const dob = parseDate(date);
    if (!dob) return null;
    const now = new Date();
    let age = now.getFullYear() - dob.getFullYear();
    if (now < new Date(now.getFullYear(), dob.getMonth(), dob.getDate())) age -= 1;
    return age;
};

const humanize = (key) =>
    key.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase()).replace(/\bCm\b/, "(cm)").trim();

const isEmpty = (v) => v === null || v === undefined || v === "" || (Array.isArray(v) && v.length === 0);

/** One labelled value. Arrays become chips; long text spans the full row. */
const Field = ({ label, value, empty = "Not provided" }) => {
    const wide = Array.isArray(value) || (typeof value === "string" && value.length > 48);

    return (
        <div className={`uv-field ${wide ? "is-wide" : ""}`}>
            <span>{label}</span>
            {isEmpty(value) ? (
                <em>{empty}</em>
            ) : Array.isArray(value) ? (
                <div className="uv-chips">{value.map((item) => <i key={String(item)} className="uv-chip">{String(item)}</i>)}</div>
            ) : typeof value === "boolean" ? (
                <strong>{value ? "Yes" : "No"}</strong>
            ) : (
                <strong>{String(value)}</strong>
            )}
        </div>
    );
};

const Section = ({ title, icon: Icon, children }) => (
    <section className="uv-section">
        <header className="uv-section-head">
            <span className="uv-section-icon"><Icon size={18} /></span>
            <h2>{title}</h2>
        </header>
        <div className="uv-grid">{children}</div>
    </section>
);

/** Renders every stored field of an object, skipping ids and anything in `skip`. */
const Entries = ({ data, skip = [], empty }) =>
    Object.entries(data || {})
        .filter(([key]) => key !== "_id" && !skip.includes(key))
        .map(([key, value]) => <Field key={key} label={humanize(key)} value={value} empty={empty} />);

const range = (min, max, unit = "") =>
    isEmpty(min) && isEmpty(max) ? null : `${min ?? "Any"} – ${max ?? "Any"}${unit}`;

const UserView = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [lightbox, setLightbox] = useState(null);
    const [copied, setCopied] = useState(false);

    const fetchUser = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const response = await adminUserService.getUser(id);
            setUser(response.data.user);
            setProfile(response.data.profile || null);
        } catch (err) {
            console.error("User details error:", err);
            setError(err.response?.data?.message || "Unable to load user details.");
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => { fetchUser(); }, [fetchUser]);

    // Profile photo first, then 0..n gallery photos (the count differs per member).
    const images = useMemo(() => {
        const main = profile?.photos?.profilePhoto?.url ? [{ url: profile.photos.profilePhoto.url, label: "Profile photo" }] : [];
        const gallery = (profile?.photos?.gallery || [])
            .filter((photo) => photo?.url)
            .map((photo, i) => ({ url: photo.url, label: `Gallery photo ${i + 1}` }));
        return [...main, ...gallery];
    }, [profile]);

    useEffect(() => {
        if (lightbox === null) return undefined;
        const onKey = (event) => {
            if (event.key === "Escape") setLightbox(null);
            if (event.key === "ArrowRight") setLightbox((i) => (i + 1) % images.length);
            if (event.key === "ArrowLeft") setLightbox((i) => (i - 1 + images.length) % images.length);
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [lightbox, images.length]);

    const copyId = async () => {
        try {
            await navigator.clipboard.writeText(user._id);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        } catch { /* clipboard unavailable */ }
    };

    if (loading && !user) {
        return (
            <AdminLayout>

                <div className="uv-page" aria-busy="true">
                    <div className="uv-hero"><span className="ad-skeleton" style={{ width: 96, height: 96 }} />
                        <div style={{ flex: 1 }}><span className="ad-skeleton" style={{ width: "40%", height: 24 }} />
                            <span className="ad-skeleton" style={{ width: "65%", marginTop: 14 }} /></div></div>
                </div>
            </AdminLayout >

        );
    }

    if (error || !user) {
        return (
            <AdminLayout>
                <div className="uv-page">
                    <div className="ad-card"><div className="ad-empty">
                        <AlertCircle size={30} />
                        <strong>Unable to load member</strong>
                        <span>{error || "User not found."}</span>
                        <button type="button" className="ad-btn ad-btn--primary" onClick={() => navigate("/admin/users")}>
                            <ArrowLeft size={16} /> Back to users
                        </button>
                    </div></div>
                </div>
            </AdminLayout>

        );
    }

    const basic = profile?.basic || {};
    const location = profile?.location || {};
    const career = profile?.career || {};
    const prefs = profile?.partnerPreferences || {};
    const birth = basic.birthDetails || {};
    const status = PROFILE_STATUS[profile?.status || "not_created"] || PROFILE_STATUS.not_created;
    const age = getAge(basic.dateOfBirth);
    const photo = images[0]?.url;
    const completion = Math.max(0, Math.min(100, Number(profile?.completionPercentage) || 0));

    const facts = [
        age !== null && `${age} years`,
        basic.heightCm && `${basic.heightCm} cm`,
        location.city && [location.city, location.state].filter(Boolean).join(", "),
        career.jobTitle || career.occupation,
    ].filter(Boolean);

    const income = !isEmpty(career.annualIncome)
        ? `${career.currency || "INR"} ${Number(career.annualIncome).toLocaleString("en-IN")} per year`
        : null;

    return (
        <AdminLayout>
            <div className="uv-page">
                <div className="uv-topbar">
                    <button type="button" className="ad-btn ad-btn--ghost" onClick={() => navigate("/admin/users")}>
                        <ArrowLeft size={16} /> Back to users
                    </button>
                    <button type="button" className="ad-btn ad-btn--ghost" onClick={fetchUser} disabled={loading}>
                        <RefreshCw size={16} className={loading ? "ad-spin" : ""} /> Refresh
                    </button>
                </div>

                {/* Member header */}
                <header className="uv-hero">
                    <button type="button" className="uv-avatar" disabled={!photo} onClick={() => setLightbox(0)}
                        aria-label={photo ? "View profile photo" : undefined}>
                        {photo ? <img src={photo} alt="" /> : <span>{user.fullName?.charAt(0)?.toUpperCase() || "U"}</span>}
                    </button>

                    <div className="uv-hero-main">
                        <div className="uv-name-row">
                            <h1>{user.fullName}</h1>
                            <span className={`ad-badge ad-badge--${ACCOUNT_TONE[user.accountStatus] || "info"}`}>{user.accountStatus}</span>
                        </div>

                        {facts.length > 0 && (
                            <p className="uv-facts">{facts.map((fact) => <span key={fact}>{fact}</span>)}</p>
                        )}

                        <div className="uv-meta">
                            <span><Mail size={14} /> {user.email}</span>
                            <span><Phone size={14} /> {user.mobile}</span>
                            <span><CalendarDays size={14} /> Joined {formatDate(user.createdAt) || "—"}</span>
                            <button type="button" className="uv-copy" onClick={copyId} title="Copy member ID">
                                {copied ? <Check size={14} /> : <Copy size={14} />} ID {user._id.slice(-8).toUpperCase()}
                            </button>
                        </div>
                    </div>
                </header>

                {/* Overview */}
                <div className="ad-stats uv-stats">
                    <div className="ad-stat">
                        <span className={`ad-stat__icon ${user.isEmailVerified ? "tone-green" : "tone-orange"}`}>
                            {user.isEmailVerified ? <ShieldCheck size={20} /> : <ShieldAlert size={20} />}
                        </span>
                        <span className="ad-stat__body"><span>Email</span><strong>{user.isEmailVerified ? "Verified" : "Not verified"}</strong></span>
                    </div>
                    <div className="ad-stat">
                        <span className="ad-stat__icon tone-violet"><Heart size={20} /></span>
                        <span className="ad-stat__body"><span>Profile</span><strong>{status.label}</strong></span>
                    </div>
                    <div className="ad-stat">
                        <span className="ad-stat__icon tone-blue"><ClipboardCheck size={20} /></span>
                        <span className="ad-stat__body"><span>Completion</span><strong>{profile ? `${completion}%` : "—"}</strong></span>
                    </div>
                    <div className="ad-stat">
                        <span className="ad-stat__icon tone-grey"><CalendarDays size={20} /></span>
                        <span className="ad-stat__body"><span>Last updated</span><strong>{formatDate(user.updatedAt) || "—"}</strong></span>
                    </div>
                </div>

                {!profile ? (
                    <div className="ad-card"><div className="ad-empty">
                        <UserRound size={30} />
                        <strong>No matrimony profile yet</strong>
                        <span>This account is registered, but the member hasn't created a profile.</span>
                    </div></div>
                ) : (
                    <div className="uv-layout">
                        <div className="uv-main">
                            {/* Photos: adapts to however many the member uploaded */}
                            <section className="uv-section">
                                <header className="uv-section-head">
                                    <span className="uv-section-icon"><Camera size={18} /></span>
                                    <h2>Photos</h2>
                                    <span className="ad-count">{images.length} {images.length === 1 ? "photo" : "photos"}</span>
                                </header>
                                {images.length === 0 ? (
                                    <div className="uv-no-photos"><ImageOff size={22} /> No photos uploaded</div>
                                ) : (
                                    <div className="uv-gallery">
                                        {images.map((image, index) => (
                                            <button type="button" key={image.url} className="uv-thumb" onClick={() => setLightbox(index)}
                                                aria-label={`Open ${image.label}`}>
                                                <img src={image.url} alt={image.label} loading="lazy" />
                                                {index === 0 && profile.photos?.profilePhoto?.url && <span>Profile</span>}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </section>

                            <section className="uv-section">
                                <header className="uv-section-head">
                                    <span className="uv-section-icon"><FileText size={18} /></span>
                                    <h2>Personal introduction</h2>
                                </header>
                                {isEmpty(profile.introduction)
                                    ? <p className="uv-intro is-empty">Not provided</p>
                                    : <p className="uv-intro">{profile.introduction}</p>}
                            </section>

                            <Section title="Basic information" icon={UserRound}>
                                <Field label="Full name" value={basic.fullName} />
                                <Field label="Profile for" value={profile.profileFor} />
                                <Field label="Gender" value={basic.gender} />
                                <Field label="Date of birth" value={formatDate(basic.dateOfBirth) && `${formatDate(basic.dateOfBirth)}${age !== null ? ` (${age} yrs)` : ""}`} />
                                <Field label="Height" value={basic.heightCm && `${basic.heightCm} cm`} />
                                <Field label="Marital status" value={basic.maritalStatus} />
                                <Field label="Mother tongue" value={basic.motherTongue} />
                                <Field label="Religion" value={basic.religion} />
                                <Field label="Community" value={basic.community} />
                                {basic.subCommunity && <Field label="Sub community" value={basic.subCommunity} />}
                                {basic.genderDescription && <Field label="Gender description" value={basic.genderDescription} />}
                                <Field label="Languages known" value={basic.languagesKnown} />
                            </Section>

                            {Object.keys(birth).length > 0 && (
                                <Section title="Horoscope" icon={Sparkles}>
                                    <Field label="Star" value={birth.star} />
                                    <Field label="Horoscope available" value={birth.horoscopeAvailable} />
                                    <Field label="Dosham" value={birth.dosham} />
                                </Section>
                            )}

                            <Section title="Location" icon={MapPin}>
                                <Field label="Country" value={location.country} />
                                <Field label="State" value={location.state} />
                                <Field label="District" value={location.district} />
                                <Field label="City" value={location.city} />
                                <Field label="Nationality" value={location.nationality} />
                                <Field label="Native place" value={location.nativePlace} />
                                <Field label="Grew up in" value={location.grewUpIn} />
                                <Field label="Willing to relocate" value={location.willingToRelocate} />
                            </Section>

                            <Section title="Education" icon={GraduationCap}>
                                <Entries data={profile.education} />
                            </Section>

                            <Section title="Career" icon={BriefcaseBusiness}>
                                <Entries data={career} skip={["annualIncome", "currency"]} />
                                <Field label="Annual income" value={income} />
                            </Section>

                            <Section title="Family" icon={Users}>
                                <Entries data={profile.family} />
                            </Section>

                            <Section title="Lifestyle" icon={Heart}>
                                <Entries data={profile.lifestyle} />
                            </Section>

                            <Section title="Partner preferences" icon={Heart}>
                                <Field label="Age" value={range(prefs.ageMin, prefs.ageMax, " yrs")} />
                                <Field label="Height" value={range(prefs.heightMinCm, prefs.heightMaxCm, " cm")} />
                                <Entries data={prefs} empty="Any"
                                    skip={["ageMin", "ageMax", "heightMinCm", "heightMaxCm"]} />
                            </Section>
                        </div>

                        <aside className="uv-aside">
                            <section className="uv-section">
                                <header className="uv-section-head">
                                    <span className="uv-section-icon"><ClipboardCheck size={18} /></span>
                                    <h2>Profile review</h2>
                                </header>
                                <span className={`ad-badge ad-badge--${status.tone}`}>{status.label}</span>

                                <div className="uv-progress" role="progressbar" aria-valuenow={completion} aria-valuemin={0} aria-valuemax={100}>
                                    <div><span>Completion</span><strong>{completion}%</strong></div>
                                    <i><b style={{ width: `${completion}%` }} /></i>
                                </div>

                                <dl className="uv-review">
                                    <div><dt>Submitted</dt><dd>{formatDate(profile.submittedAt, true) || "—"}</dd></div>
                                    <div><dt>Reviewed</dt><dd>{formatDate(profile.reviewedAt, true) || "—"}</dd></div>
                                    <div><dt>Review note</dt><dd>{profile.reviewNote || "—"}</dd></div>
                                </dl>
                            </section>
                        </aside>
                    </div>
                )}

                {lightbox !== null && images[lightbox] && (
                    <div className="uv-lightbox" role="dialog" aria-modal="true" aria-label="Photo viewer"
                        onMouseDown={(e) => e.target === e.currentTarget && setLightbox(null)}>
                        <button type="button" className="uv-lb-close" aria-label="Close" onClick={() => setLightbox(null)}><X size={20} /></button>
                        {images.length > 1 && (
                            <button type="button" className="uv-lb-nav is-prev" aria-label="Previous photo"
                                onClick={() => setLightbox((i) => (i - 1 + images.length) % images.length)}><ChevronLeft size={24} /></button>
                        )}
                        <figure>
                            <img src={images[lightbox].url} alt={images[lightbox].label} />
                            <figcaption>{images[lightbox].label} · {lightbox + 1} of {images.length}</figcaption>
                        </figure>
                        {images.length > 1 && (
                            <button type="button" className="uv-lb-nav is-next" aria-label="Next photo"
                                onClick={() => setLightbox((i) => (i + 1) % images.length)}><ChevronRight size={24} /></button>
                        )}
                    </div>
                )}
            </div>
        </AdminLayout>

    );
};

export default UserView;