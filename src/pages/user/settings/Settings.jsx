import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import "./Settings.css";
import AppLayout from "../../../components/user/layout/AppLayout.jsx";

import {
    User,
    Shield,
    Lock,
    Smartphone,
    Bell,
    Eye,
    Users,
    Download,
    Trash2,
    ChevronRight,
    Pencil,
    CircleHelp,
    Info,
    X,
    LogOut,
    Check,
} from "lucide-react";

// Adjust these two paths to match where your contexts live.
import { AuthContext } from "../../../context/user/AuthContext.jsx";
import { ProfileContext } from "../../../context/user/ProfileContext.jsx";

import packageJson from "../../../../package.json";

const APP_VERSION = packageJson.version;

const PROFILE_STATUS = {
    approved: { label: "Approved", tone: "ok" },
    pending_review: { label: "Under review", tone: "warn" },
    draft: { label: "Draft", tone: "muted" },
    changes_requested: { label: "Needs changes", tone: "warn" },
    rejected: { label: "Needs changes", tone: "warn" },
    not_created: { label: "Not started", tone: "muted" },
    unknown: { label: "Checking…", tone: "muted" },
};

const NAV = [
    ["account", "Account", "user"],
    ["security", "Security", "lock"],
    ["notifications", "Notifications", "bell"],
    ["privacy", "Privacy", "eye"],
    ["data", "Your data", "download"],
    ["danger", "Delete profile", "trash"],
];

const NOTIFICATIONS = [
    ["newMatches", "New matches", "When profiles that fit your preferences join."],
    ["interests", "Interests received", "When someone sends you an interest."],
    ["messages", "Messages", "When you get a new message."],
    ["profileUpdates", "Profile review", "When your profile or changes are approved or need edits."],
    ["emailUpdates", "Email updates", "Important account notices sent to your inbox."],
];

const MESSAGE_OPTIONS = [
    ["everyone", "Everyone"],
    ["matches", "Mutual interests"],
    ["nobody", "No one"],
];
const ICONS = {
    user: User,
    shield: Shield,
    lock: Lock,
    device: Smartphone,
    bell: Bell,
    eye: Eye,
    users: Users,
    download: Download,
    trash: Trash2,
    chevron: ChevronRight,
    edit: Pencil,
    help: CircleHelp,
    info: Info,
    close: X,
    logout: LogOut,
    check: Check,
};

function Icon({ name, size = 20, ...props }) {
    const LucideIcon = ICONS[name] || Info;

    return (
        <LucideIcon
            size={size}
            strokeWidth={1.8}
            aria-hidden="true"
            {...props}
        />
    );
}

function Toggle({ checked, onChange, label }) {
    return (
        <button type="button" role="switch" aria-checked={checked} aria-label={label}
            className={`st-toggle ${checked ? "is-on" : ""}`} onClick={() => onChange(!checked)}>
            <span />
        </button>
    );
}

function Section({ id, icon, title, subtitle, danger = false, children }) {
    return (
        <section id={id} className={`st-card ${danger ? "st-card-danger" : ""}`}>
            <header className="st-card-head">
                <span className="st-card-icon"><Icon name={icon} size={19} /></span>
                <div>
                    <h2>{title}</h2>
                    <p>{subtitle}</p>
                </div>
            </header>
            <div className="st-card-body">{children}</div>
        </section>
    );
}

function Row({ title, description, children }) {
    return (
        <div className="st-row">
            <div className="st-row-text">
                <h3>{title}</h3>
                <p>{description}</p>
            </div>
            <div className="st-row-control">{children}</div>
        </div>
    );
}

function ActionButton({ children, onClick, disabled, to, danger = false }) {
    const className = `st-action ${danger ? "is-danger" : ""}`;
    if (to && !disabled) {
        return <Link to={to} className={className}>{children}<Icon name="chevron" size={14} /></Link>;
    }
    return (
        <button type="button" className={className} onClick={onClick} disabled={disabled}>
            {children}{!disabled && <Icon name="chevron" size={14} />}
        </button>
    );
}

function CompletionRing({ value }) {
    const pct = Math.max(0, Math.min(100, Math.round(value || 0)));
    const radius = 30;
    const circumference = 2 * Math.PI * radius;

    return (
        <div className="st-ring" role="img" aria-label={`Profile ${pct}% complete`}>
            <svg width="76" height="76" viewBox="0 0 76 76">
                <circle cx="38" cy="38" r={radius} className="st-ring-track" />
                <circle cx="38" cy="38" r={radius} className="st-ring-fill"
                    strokeDasharray={circumference}
                    strokeDashoffset={circumference * (1 - pct / 100)} />
            </svg>
            <strong>{pct}%</strong>
        </div>
    );
}

export default function Settings({
    user: userProp,
    onChangePassword,
    onManageBlockedUsers,
    onDownloadData,
    onDeleteProfile,
}) {
    const auth = useContext(AuthContext);
    const profileCtx = useContext(ProfileContext);

    const user = userProp || auth?.user || {};
    const profileStatus = profileCtx?.profileStatus || "unknown";
    const revisionStatus = profileCtx?.revisionStatus;
    const completion = profileCtx?.completionPercentage || 0;

    const statusKey =
        revisionStatus === "pending_review" ? "pending_review" : profileStatus;
    const status = PROFILE_STATUS[statusKey] || PROFILE_STATUS.unknown;

    const displayName =
        user.name || user.fullName || user.firstName || user.email?.split("@")[0] || "Your account";
    const initial = displayName.trim().charAt(0).toUpperCase();

    const [notifications, setNotifications] = useState({
        newMatches: true,
        interests: true,
        messages: true,
        profileUpdates: true,
        emailUpdates: true,
    });
    const [profileVisibility, setProfileVisibility] = useState(true);
    const [showLastActive, setShowLastActive] = useState(true);
    const [whoCanMessage, setWhoCanMessage] = useState("matches");

    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [deleteConfirmation, setDeleteConfirmation] = useState("");
    const [deleting, setDeleting] = useState(false);

    const [activeSection, setActiveSection] = useState("account");
    const [toast, setToast] = useState("");
    const toastTimer = useRef(null);

    const flash = useCallback((message = "Preference saved") => {
        setToast(message);
        clearTimeout(toastTimer.current);
        toastTimer.current = setTimeout(() => setToast(""), 1800);
    }, []);

    useEffect(() => () => clearTimeout(toastTimer.current), []);

    // Highlight the nav item for the section in view.
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) setActiveSection(entry.target.id);
                });
            },
            { rootMargin: "-25% 0px -65% 0px" }
        );
        NAV.forEach(([id]) => {
            const el = document.getElementById(id);
            if (el) observer.observe(el);
        });
        return () => observer.disconnect();
    }, []);

    const closeDialog = useCallback(() => {
        setShowDeleteDialog(false);
        setDeleteConfirmation("");
    }, []);

    useEffect(() => {
        if (!showDeleteDialog) return undefined;
        const onKey = (event) => event.key === "Escape" && closeDialog();
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [showDeleteDialog, closeDialog]);

    const scrollTo = (id) => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    const setNotification = (key, value) => {
        setNotifications((current) => ({ ...current, [key]: value }));
        flash();
    };

    const handleDeleteProfile = async () => {
        if (deleteConfirmation !== "DELETE" || !onDeleteProfile) return;
        try {
            setDeleting(true);
            await onDeleteProfile();
            closeDialog();
        } finally {
            setDeleting(false);
        }
    };

    const handleLogout = async () => {
        try {
            await auth?.logout?.();
        } catch {
            /* session is cleared by the provider either way */
        }
    };

    return (
        <AppLayout>
            <main className="settings-page">
                {/* Identity header */}
                <section className="st-hero">
                    <div className="st-avatar" aria-hidden="true">{initial}</div>
                    <div className="st-hero-main">
                        <h1>{displayName}</h1>
                        <p>{user.email || "Email not available"}</p>
                        <div className="st-hero-meta">
                            <span className={`st-pill st-pill-${status.tone}`}>
                                <i /> {status.label}
                            </span>
                            <span className="st-hero-note">Manage your account, privacy and alerts.</span>
                        </div>
                    </div>
                    <CompletionRing value={completion} />
                    <Link to="/profile-setup?mode=edit" className="st-hero-button">
                        <Icon name="edit" size={16} /> Edit profile
                    </Link>
                </section>

                <div className="st-layout">
                    {/* Section nav */}
                    <nav className="st-nav" aria-label="Settings sections">
                        {NAV.map(([id, label, icon]) => (
                            <button key={id} type="button"
                                className={`st-nav-item ${activeSection === id ? "is-active" : ""} ${id === "danger" ? "is-danger" : ""}`}
                                aria-current={activeSection === id ? "true" : undefined}
                                onClick={() => scrollTo(id)}>
                                <Icon name={icon} size={17} />
                                <span>{label}</span>
                            </button>
                        ))}
                    </nav>

                    <div className="st-main">
                        <Section id="account" icon="user" title="Account" subtitle="The details you signed up with">
                            <div className="st-details">
                                <div>
                                    <span>Email address</span>
                                    <strong>{user.email || "Not available"}</strong>
                                </div>
                                <div>
                                    <span>Mobile number</span>
                                    <strong>{user.mobile || user.phone || "Not available"}</strong>
                                </div>
                            </div>
                            <Row title="Sign out" description="Sign out of GenZ Matrimony on this device.">
                                <ActionButton onClick={handleLogout} disabled={!auth?.logout}>Sign out</ActionButton>
                            </Row>
                        </Section>

                        <Section id="security" icon="lock" title="Security" subtitle="Keep your account protected">
                            <Row title="Change password" description="Choose a new password you don't use anywhere else.">
                                <ActionButton onClick={onChangePassword} disabled={!onChangePassword}>Change</ActionButton>
                            </Row>
                            <Row title="Login activity" description="See the devices where you're signed in.">
                                <span className="st-soon"><Icon name="device" size={14} /> Coming soon</span>
                            </Row>
                        </Section>

                        <Section id="notifications" icon="bell" title="Notifications" subtitle="Choose what you hear about">
                            {NOTIFICATIONS.map(([key, title, description]) => (
                                <Row key={key} title={title} description={description}>
                                    <Toggle label={title} checked={notifications[key]}
                                        onChange={(value) => setNotification(key, value)} />
                                </Row>
                            ))}
                        </Section>

                        <Section id="privacy" icon="eye" title="Privacy" subtitle="Control who finds and contacts you">
                            <Row title="Appear in match searches"
                                description="Let your approved profile show up for people looking for a match.">
                                <Toggle label="Appear in match searches" checked={profileVisibility}
                                    onChange={(value) => { setProfileVisibility(value); flash(); }} />
                            </Row>
                            <Row title="Show when I was last active"
                                description="Other members can see how recently you visited.">
                                <Toggle label="Show last active" checked={showLastActive}
                                    onChange={(value) => { setShowLastActive(value); flash(); }} />
                            </Row>
                            <div className="st-row st-row-stack">
                                <div className="st-row-text">
                                    <h3>Who can message you</h3>
                                    <p>Limit new conversations to the people you choose.</p>
                                </div>
                                <div className="st-segment" role="radiogroup" aria-label="Who can message you">
                                    {MESSAGE_OPTIONS.map(([value, label]) => (
                                        <button key={value} type="button" role="radio"
                                            aria-checked={whoCanMessage === value}
                                            className={whoCanMessage === value ? "is-selected" : ""}
                                            onClick={() => { setWhoCanMessage(value); flash(); }}>
                                            {whoCanMessage === value && <Icon name="check" size={14} />}
                                            {label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <Row title="Blocked members" description="Review and unblock people you've blocked.">
                                <ActionButton onClick={onManageBlockedUsers} disabled={!onManageBlockedUsers}>Manage</ActionButton>
                            </Row>
                        </Section>

                        <Section id="data" icon="download" title="Your data" subtitle="Get a copy of what we hold about you">
                            <Row title="Download my data"
                                description="Request a copy of your account and profile information.">
                                <ActionButton onClick={onDownloadData} disabled={!onDownloadData}>Request data</ActionButton>
                            </Row>
                        </Section>

                        <Section id="danger" icon="trash" title="Delete profile" danger
                            subtitle="Remove your profile from GenZ Matrimony">
                            <p className="st-danger-copy">
                                Deleting removes your profile from discovery and matching. Your details, photos
                                and interests may be permanently erased, subject to our retention and legal
                                requirements.
                            </p>
                            <button type="button" className="st-delete-button" onClick={() => setShowDeleteDialog(true)}>
                                <Icon name="trash" size={16} /> Delete my profile
                            </button>
                        </Section>
                    </div>

                    <aside className="st-aside">
                        <div className="st-help">
                            <span className="st-card-icon"><Icon name="help" size={20} /></span>
                            <h3>Need a hand?</h3>
                            <p>Our support team can help with your account, profile review or privacy questions.</p>
                            <Link to="/support" className="st-help-link">
                                Contact support <Icon name="chevron" size={14} />
                            </Link>
                        </div>
                        <div className="st-version">
                            <h3>GenZ Matrimony</h3>
                            <strong>Version {APP_VERSION}</strong>
                        </div>
                    </aside>
                </div>

                <div className={`st-toast ${toast ? "is-visible" : ""}`} role="status" aria-live="polite">
                    <Icon name="check" size={15} /> {toast || "Saved"}
                </div>

                {showDeleteDialog && (
                    <div className="st-backdrop" role="presentation"
                        onMouseDown={(event) => event.target === event.currentTarget && closeDialog()}>
                        <div className="st-modal" role="dialog" aria-modal="true" aria-labelledby="delete-profile-title">
                            <button type="button" className="st-modal-close" aria-label="Close" onClick={closeDialog}>
                                <Icon name="close" size={18} />
                            </button>
                            <span className="st-modal-icon"><Icon name="trash" size={24} /></span>
                            <h2 id="delete-profile-title">Delete your profile?</h2>
                            <p>
                                Your profile, photos, interests and match activity will be removed. This can't
                                easily be undone.
                            </p>
                            <label htmlFor="delete-profile-confirm">Type <strong>DELETE</strong> to confirm</label>
                            <input id="delete-profile-confirm" type="text" value={deleteConfirmation}
                                onChange={(event) => setDeleteConfirmation(event.target.value)}
                                placeholder="DELETE" autoComplete="off" />
                            {!onDeleteProfile && (
                                <p className="st-modal-note">Deletion will work once the delete-profile API is connected.</p>
                            )}
                            <div className="st-modal-actions">
                                <button type="button" className="st-cancel" onClick={closeDialog}>Keep my profile</button>
                                <button type="button" className="st-confirm"
                                    disabled={deleteConfirmation !== "DELETE" || !onDeleteProfile || deleting}
                                    onClick={handleDeleteProfile}>
                                    {deleting ? "Deleting…" : "Delete profile"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </AppLayout>
    );
}