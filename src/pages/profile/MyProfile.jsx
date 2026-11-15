import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    UserRound, Heart, MapPin, Briefcase, GraduationCap, Languages,
    UsersRound, Sparkles, Camera, Pencil, Check, Target, ShieldCheck,
    Expand, Star, House,
} from "lucide-react";

import { useProfile } from "../../hooks/useProfile.js";
import AppLayout from "../../components/layout/AppLayout.jsx";
import Button from "../../components/ui/Button.jsx";
import PhotoLightbox from "../../components/profile/PhotoLightBox.jsx";
import { photoUrl } from "../../utils/imageUtils.js";

import "./MyProfile.css";

/* ==========================================================================
   Formatting helpers
   Each returns null when there is nothing worth showing, so empty details
   simply disappear instead of printing "Not specified".
   ========================================================================== */
const isFilled = (value) =>
    !(value === null || value === undefined || value === "" || (Array.isArray(value) && value.length === 0));

const capitalise = (text) => (text ? text.charAt(0).toUpperCase() + text.slice(1) : text);

function formatValue(value) {
    if (!isFilled(value)) return null;
    if (typeof value === "boolean") return value ? "Yes" : "No";
    if (Array.isArray(value)) return value.join(", ");
    return String(value);
}

function formatDate(value) {
    if (!value) return null;

    // Avoid timezone shifting for date-only values.
    const date = new Date(`${String(value).slice(0, 10)}T00:00:00`);
    if (Number.isNaN(date.getTime())) return null;

    return date.toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });
}

function calculateAge(value) {
    if (!value) return null;

    const dob = new Date(value);
    if (Number.isNaN(dob.getTime())) return null;

    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDifference = today.getMonth() - dob.getMonth();

    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < dob.getDate())) age--;

    return age >= 0 ? age : null;
}

function feetAndInches(cm) {
    let totalInches = Math.round(Number(cm) / 2.54);
    const feet = Math.floor(totalInches / 12);
    totalInches -= feet * 12;
    return `${feet}′${totalInches}″`;
}

const formatHeight = (cm) => (cm ? `${feetAndInches(cm)} · ${cm} cm` : null);

function formatIncome(value, currency = "INR") {
    if (!isFilled(value)) return null;

    try {
        return `${new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: currency || "INR",
            maximumFractionDigits: 0,
        }).format(Number(value))} / year`;
    } catch {
        return `${currency || "INR"} ${value}`;
    }
}

function siblingText(total, married) {
    if (!isFilled(total)) return null;
    if (Number(total) === 0) return "None";
    return isFilled(married) ? `${total} · ${married} married` : String(total);
}

const meaningful = (value) => (value && value !== "Prefer not to say" ? value : null);

/** "Hindu, Christian +1" — keeps summary chips short. */
function summarise(list, max = 2) {
    if (!isFilled(list)) return null;
    const shown = list.slice(0, max).join(", ");
    return list.length > max ? `${shown} +${list.length - max}` : shown;
}

/* ==========================================================================
   Lucide icons
   ========================================================================== */
const ICONS = {
    user: UserRound,
    heart: Heart,
    pin: MapPin,
    briefcase: Briefcase,
    cap: GraduationCap,
    language: Languages,
    users: UsersRound,
    sparkle: Sparkles,
    camera: Camera,
    edit: Pencil,
    check: Check,
    target: Target,
    shield: ShieldCheck,
    expand: Expand,
    star: Star,
    home: House,
};

function Icon({ name, size = 18 }) {
    const LucideIcon = ICONS[name];
    if (!LucideIcon) return null;

    return (
        <LucideIcon
            size={size}
            strokeWidth={1.7}
            aria-hidden="true"
            focusable="false"
        />
    );
}

/* ==========================================================================
   Small building blocks
   ========================================================================== */
function Photo({ photo, width, height, face = false, eager = false, alt }) {
    const src = photoUrl(photo.url, { width, height, face });

    function fallBackToOriginal(event) {
        const image = event.currentTarget;
        if (image.dataset.fallback) return;
        image.dataset.fallback = "true";
        image.src = photo.url;
    }

    return (
        <img
            src={src}
            alt={alt}
            width={width}
            height={height}
            loading={eager ? "eager" : "lazy"}
            decoding="async"
            onError={fallBackToOriginal}
        />
    );
}

function Section({ id, icon, title, subtitle, onEdit, children }) {
    return (
        <section id={id} className="mp-card mp-section" aria-labelledby={`${id}-title`}>
            <header className="mp-section__header">
                <span className="mp-section__icon"><Icon name={icon} size={20} /></span>

                <div className="mp-section__heading">
                    <h2 id={`${id}-title`}>{title}</h2>
                    {subtitle && <p>{subtitle}</p>}
                </div>

                {onEdit && (
                    <button type="button" className="mp-link" onClick={onEdit}>
                        <Icon name="edit" size={15} /> Edit
                    </button>
                )}
            </header>

            {children}
        </section>
    );
}

function EmptyHint({ children, onAction, actionLabel = "Add details" }) {
    return (
        <div className="mp-empty">
            <p>{children}</p>
            {onAction && <button type="button" className="mp-link" onClick={onAction}>{actionLabel}</button>}
        </div>
    );
}

/** Groups of label/value pairs. Empty values and empty groups are skipped. */
function FactGroups({ groups, emptyText, onEdit }) {
    const filled = groups
        .map((group) => ({
            ...group,
            items: group.items.map(([label, value]) => [label, formatValue(value)]).filter(([, value]) => value),
        }))
        .filter((group) => group.items.length);

    if (!filled.length) return emptyText ? <EmptyHint onAction={onEdit}>{emptyText}</EmptyHint> : null;

    return filled.map((group) => (
        <div className="mp-group" key={group.title}>
            <h3 className="mp-group__title">{group.title}</h3>
            <dl className="mp-grid">
                {group.items.map(([label, value]) => (
                    <div className="mp-detail" key={label}>
                        <dt>{label}</dt>
                        <dd>{value}</dd>
                    </div>
                ))}
            </dl>
        </div>
    ));
}

function Tags({ values, tone = "blue" }) {
    return (
        <ul className="mp-tags">
            {values.map((item, index) => (
                <li key={`${item}-${index}`} className={`mp-tag mp-tag--${tone}`}>{item}</li>
            ))}
        </ul>
    );
}

/* ==========================================================================
   Partner preferences
   ========================================================================== */
const PREFERENCE_GROUPS = [
    {
        title: "Background",
        rows: [["Marital status", "maritalStatuses"], ["Religion", "religions"], ["Community", "communities"], ["Mother tongue", "motherTongues"]],
    },
    {
        title: "Education & career",
        rows: [["Education", "educationLevels"], ["Occupation", "occupations"], ["Employment", "employmentTypes"]],
    },
    {
        title: "Location",
        rows: [["Countries", "countries"], ["States", "states"], ["Cities", "cities"]],
    },
    {
        title: "Lifestyle",
        rows: [["Diet", "diets"], ["Smoking", "smokingPreferences"], ["Drinking", "drinkingPreferences"]],
    },
];

function PreferenceGroup({ group, preferences }) {
    const chosen = group.rows.filter(([, key]) => isFilled(preferences[key]));
    const open = group.rows.filter(([, key]) => !isFilled(preferences[key])).map(([label]) => label);

    return (
        <div className="mp-group">
            <h3 className="mp-group__title">{group.title}</h3>

            {chosen.map(([label, key]) => (
                <div className="mp-pref-row" key={key}>
                    <span className="mp-pref-row__label">{label}</span>
                    <Tags values={preferences[key]} />
                </div>
            ))}

            {open.length > 0 && (
                <p className="mp-open">
                    <Icon name="check" size={14} /> Open to any: {open.join(", ")}
                </p>
            )}
        </div>
    );
}

/* ==========================================================================
   Sidebar: profile strength + review status
   ========================================================================== */
const RING_RADIUS = 46;
const RING_LENGTH = 2 * Math.PI * RING_RADIUS;

function strengthLabel(percent) {
    if (percent >= 90) return "Outstanding";
    if (percent >= 70) return "Strong";
    if (percent >= 40) return "Looking good";
    return "Getting started";
}

function StrengthCard({ percent, checklist, onEdit }) {
    const gradientId = `mp-ring-${useId().replace(/:/g, "")}`;
    const clamped = Math.min(100, Math.max(0, percent));
    const pending = checklist.filter((item) => !item.done);

    return (
        <section className="mp-card mp-aside-card" aria-labelledby="mp-strength-title">
            <div className="mp-strength">
                <div className="mp-ring" role="img" aria-label={`Profile ${clamped}% complete`}>
                    <svg viewBox="0 0 110 110" aria-hidden="true">
                        <defs>
                            <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
                                <stop offset="0%" stopColor="#ec1f6b" />
                                <stop offset="100%" stopColor="#ff7a29" />
                            </linearGradient>
                        </defs>
                        <circle className="mp-ring__track" cx="55" cy="55" r={RING_RADIUS} />
                        <circle
                            className="mp-ring__value"
                            cx="55"
                            cy="55"
                            r={RING_RADIUS}
                            stroke={`url(#${gradientId})`}
                            strokeDasharray={RING_LENGTH}
                            strokeDashoffset={RING_LENGTH * (1 - clamped / 100)}
                        />
                    </svg>
                    <strong>{clamped}%</strong>
                </div>

                <div>
                    <h2 id="mp-strength-title">Profile Strength</h2>
                    <p className="mp-strength__label">{strengthLabel(clamped)}</p>
                </div>
            </div>

            <ul className="mp-checklist">
                {checklist.map((item) => (
                    <li key={item.label} className={item.done ? "is-done" : ""}>
                        <span className="mp-checklist__mark" aria-hidden="true">
                            {item.done && <Icon name="check" size={12} />}
                        </span>
                        <span>{item.label}</span>
                        <span className="visually-hidden">{item.done ? "(done)" : "(to do)"}</span>
                    </li>
                ))}
            </ul>

            {pending.length > 0 && (
                <Button variant="secondary" onClick={onEdit}>Complete my profile</Button>
            )}
        </section>
    );
}

const STATUS_COPY = {
    approved: { label: "Approved", icon: "shield", text: "Your profile is live and visible to other members." },
    pending_review: { label: "Under review", icon: "star", text: "Our team is reviewing your profile. It becomes visible once approved." },
    needs_changes: { label: "Changes required", icon: "edit", text: "Our team asked for a few updates before your profile can go live." },
    rejected: { label: "Not approved", icon: "shield", text: "Your profile could not be approved. Contact support if you need clarification." },
    draft: { label: "Draft", icon: "edit", text: "Finish your details and submit your profile for approval." },
    not_created: { label: "Not created", icon: "edit", text: "Create your profile to get started." },
};

function StatusCard({ status, reviewNote, onEdit }) {
    const copy = STATUS_COPY[status] || { label: "Profile", icon: "star", text: "" };
    const canEdit = ["needs_changes", "draft", "not_created"].includes(status);

    return (
        <section className={`mp-card mp-aside-card mp-status mp-status--${status}`} aria-labelledby="mp-status-title">
            <div className="mp-status__head">
                <span className="mp-status__icon"><Icon name={copy.icon} size={18} /></span>
                <div>
                    <span className="mp-status__eyebrow">Review status</span>
                    <h2 id="mp-status-title">{copy.label}</h2>
                </div>
            </div>

            <p>{copy.text}</p>

            {reviewNote && (
                <blockquote className="mp-status__note">
                    <span>Note from our team</span>
                    {reviewNote}
                </blockquote>
            )}

            {canEdit && <Button variant="secondary" onClick={onEdit}>Update profile</Button>}
            {status === "rejected" && <a className="mp-status__link" href="/support">Contact support</a>}
        </section>
    );
}

/* ==========================================================================
   Section navigation
   - equal-width tabs when there is room, horizontal scroll when there is not
   - the active tab is kept in view and edge fades hint at more tabs
   - scroll-spy follows the page; clicking a tab holds the highlight until the
     person scrolls again (so short / last sections don't flip back)
   ========================================================================== */
const NAV_SECTIONS = [
    { id: "mp-about", label: "About", icon: "sparkle" },
    { id: "mp-personal", label: "Personal", icon: "user" },
    { id: "mp-career", label: "Career", icon: "briefcase" },
    { id: "mp-family", label: "Family", icon: "home" },
    { id: "mp-lifestyle", label: "Lifestyle", icon: "star" },
    { id: "mp-preferences", label: "Preferences", icon: "target" },
    { id: "mp-photos", label: "Photos", icon: "camera" },
];

const SECTION_IDS = NAV_SECTIONS.map(({ id }) => id);

const HEADER_SELECTOR = ".app-header"; // the app's sticky / fixed top bar, if any
const SPY_TOLERANCE = 16; // px below the nav where a section counts as "current"
const SECTION_GAP = 8; // px between the nav and a section after jumping to it

const prefersReducedMotion = () => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/* ==========================================================================
   Scroll helpers
   The page can be scrolled by the window OR by a wrapper (for example the app
   shell's <main>). These helpers find out which, at the moment they are
   needed, so sticky offsets and "jump to section" work either way.
   ========================================================================== */

/** The ancestor that really scrolls the page, or null when the window does. */
function getScroller(node) {
    for (let el = node?.parentElement; el && el !== document.body && el !== document.documentElement; el = el.parentElement) {
        if (/(auto|scroll|overlay)/.test(getComputedStyle(el).overflowY) && el.scrollHeight > el.clientHeight + 1) {
            return el;
        }
    }
    return null;
}

const scrollportTop = (scroller) => (scroller ? scroller.getBoundingClientRect().top : 0);

/**
 * How far below the top of the scrolling area sticky elements must sit.
 * Non-zero only when a sticky/fixed header overlays that area.
 */
function measureStickyTop(node) {
    const header = document.querySelector(HEADER_SELECTOR);
    if (!header) return 0;

    const { position } = getComputedStyle(header);
    if (position !== "fixed" && position !== "sticky") return 0;

    return Math.max(0, Math.round(header.getBoundingClientRect().bottom - scrollportTop(getScroller(node))));
}

/** Publishes the measured value as --mp-sticky-top (only touches the DOM when it changes). */
function syncStickyTop(page) {
    const value = `${measureStickyTop(page)}px`;
    if (page.style.getPropertyValue("--mp-sticky-top") !== value) {
        page.style.setProperty("--mp-sticky-top", value);
    }
}

/**
 * Section navigation behaviour:
 *  - keeps --mp-sticky-top correct (header changes, resize, shell differences)
 *  - scroll-spy: highlights the section under the sticky nav
 *  - goTo(): smooth-scrolls so the section lands just under the nav; the clicked
 *    tab stays highlighted until the person scrolls again
 *  - stuck: true while the nav is pinned (adds a shadow)
 */
function useSectionNav(pageRef, navRef, enabled) {
    const [active, setActive] = useState(SECTION_IDS[0]);
    const [stuck, setStuck] = useState(false);
    const locked = useRef(false);
    const startedAtTop = useRef(false);

    useLayoutEffect(() => {
        const page = pageRef.current;
        if (!enabled || !page) return undefined;

        syncStickyTop(page);

        const sync = () => syncStickyTop(page);
        window.addEventListener("resize", sync);

        const header = document.querySelector(HEADER_SELECTOR);
        const observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(sync) : null;
        if (header) observer?.observe(header);

        return () => {
            window.removeEventListener("resize", sync);
            observer?.disconnect();
        };
    }, [pageRef, enabled]);

    useEffect(() => {
        const page = pageRef.current;
        if (!enabled || !page) return undefined;

        // The app shell keeps its scroll position between pages; start this one at the top.
        if (!startedAtTop.current) {
            startedAtTop.current = true;
            (getScroller(page) ?? window).scrollTo({ top: 0 });
        }

        let frame = 0;

        function update() {
            frame = 0;

            const nav = navRef.current;
            if (!nav) return;

            syncStickyTop(page);

            const scroller = getScroller(page);
            const navRect = nav.getBoundingClientRect();
            const stickLine = scrollportTop(scroller) + measureStickyTop(page);

            setStuck(navRect.top <= stickLine + 1);

            if (locked.current) return;

            const scrolled = scroller ? scroller.scrollTop > 0 : window.scrollY > 0;
            const atBottom = scroller
                ? scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 4
                : window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;

            let current = SECTION_IDS[0];

            if (scrolled && atBottom) {
                current = SECTION_IDS[SECTION_IDS.length - 1];
            } else {
                SECTION_IDS.forEach((id) => {
                    const element = document.getElementById(id);
                    if (element && element.getBoundingClientRect().top <= navRect.bottom + SPY_TOLERANCE) {
                        current = id;
                    }
                });
            }

            setActive(current);
        }

        const onScroll = () => {
            if (!frame) frame = requestAnimationFrame(update);
        };
        const unlock = () => {
            locked.current = false;
        };

        // Capture phase: element scroll events don't bubble, but they can be captured on window.
        window.addEventListener("scroll", onScroll, { capture: true, passive: true });
        window.addEventListener("resize", onScroll);
        // Any real interaction hands control back to the scroll position.
        ["wheel", "touchstart", "keydown", "pointerdown"].forEach((type) =>
            window.addEventListener(type, unlock, { passive: true })
        );
        update();

        return () => {
            if (frame) cancelAnimationFrame(frame);
            window.removeEventListener("scroll", onScroll, { capture: true });
            window.removeEventListener("resize", onScroll);
            ["wheel", "touchstart", "keydown", "pointerdown"].forEach((type) =>
                window.removeEventListener(type, unlock)
            );
        };
    }, [pageRef, navRef, enabled]);

    const goTo = useCallback(
        (id) => {
            const page = pageRef.current;
            const section = document.getElementById(id);
            if (!page || !section) return;

            locked.current = true;
            setActive(id);

            const scroller = getScroller(page);
            const navHeight = navRef.current?.offsetHeight ?? 0;
            const landingLine = scrollportTop(scroller) + measureStickyTop(page) + navHeight + SECTION_GAP;

            (scroller ?? window).scrollBy({
                top: section.getBoundingClientRect().top - landingLine,
                behavior: prefersReducedMotion() ? "auto" : "smooth",
            });
        },
        [pageRef, navRef]
    );

    return [active, stuck, goTo];
}

/**
 * Pin the sidebar only when it fits completely in view next to the main column.
 * No inner scrolling and no cut-off cards: if it doesn't fit, it scrolls normally.
 */
function usePinnedAside(asideRef, pageRef, enabled) {
    const [pinned, setPinned] = useState(false);

    useLayoutEffect(() => {
        const aside = asideRef.current;
        const page = pageRef.current;
        if (!enabled || !aside || !page) return undefined;

        function check() {
            const sideBySide = getComputedStyle(aside.parentElement).gridTemplateColumns.split(" ").length > 1;
            const scroller = getScroller(page);
            const viewportHeight = scroller ? scroller.clientHeight : window.innerHeight;
            const pinnedTop = measureStickyTop(page) + 12;

            setPinned(sideBySide && aside.offsetHeight + pinnedTop + 16 <= viewportHeight);
        }

        check();
        window.addEventListener("resize", check);
        const observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(check) : null;
        observer?.observe(aside);

        return () => {
            window.removeEventListener("resize", check);
            observer?.disconnect();
        };
    }, [asideRef, pageRef, enabled]);

    return pinned;
}

function SectionNav({ navRef, active, stuck, onSelect }) {
    const listRef = useRef(null);
    const [hints, setHints] = useState({ start: false, end: false });

    const updateHints = useCallback(() => {
        const list = listRef.current;
        if (!list) return;

        setHints({
            start: list.scrollLeft > 4,
            end: list.scrollLeft + list.clientWidth < list.scrollWidth - 4,
        });
    }, []);

    useEffect(() => {
        updateHints();
        window.addEventListener("resize", updateHints);
        return () => window.removeEventListener("resize", updateHints);
    }, [updateHints]);

    // Keep the active tab visible when the tab list scrolls sideways.
    useEffect(() => {
        const list = listRef.current;
        const tab = list?.querySelector('[aria-current="true"]');
        if (!list || !tab || list.scrollWidth <= list.clientWidth) return;

        const left = tab.offsetLeft - (list.clientWidth - tab.offsetWidth) / 2;
        list.scrollTo?.({ left, behavior: prefersReducedMotion() ? "auto" : "smooth" });
    }, [active]);

    return (
        <nav ref={navRef} className={`mp-nav ${stuck ? "is-stuck" : ""}`.trim()} aria-label="Profile sections">
            <div className={`mp-nav__bar ${hints.start ? "has-start" : ""} ${hints.end ? "has-end" : ""}`.trim()}>
                <ul ref={listRef} className="mp-nav__list" onScroll={updateHints}>
                    {NAV_SECTIONS.map(({ id, label, icon }) => (
                        <li key={id}>
                            <button
                                type="button"
                                className={`mp-nav__tab ${active === id ? "is-active" : ""}`.trim()}
                                aria-current={active === id ? "true" : undefined}
                                onClick={() => onSelect(id)}
                            >
                                <Icon name={icon} size={16} />
                                <span>{label}</span>
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        </nav>
    );
}

/* ==========================================================================
   Page states
   ========================================================================== */
function ProfileSkeleton() {
    return (
        <div className="mp-page" aria-busy="true" aria-label="Loading your profile">
            <div className="mp-card mp-skeleton-hero">
                <div className="mp-skeleton mp-skeleton--photo" />
                <div className="mp-skeleton-lines">
                    <div className="mp-skeleton" style={{ width: "55%", height: 34 }} />
                    <div className="mp-skeleton" style={{ width: "30%", height: 22 }} />
                    <div className="mp-skeleton" style={{ width: "80%", height: 16 }} />
                    <div className="mp-skeleton" style={{ width: "70%", height: 16 }} />
                    <div className="mp-skeleton" style={{ width: "60%", height: 16 }} />
                </div>
            </div>
            <div className="mp-card mp-skeleton-card"><div className="mp-skeleton" style={{ height: 120 }} /></div>
        </div>
    );
}

function PageState({ icon, title, text, children }) {
    return (
        <div className="mp-state">
            <span className="mp-state__icon"><Icon name={icon} size={28} /></span>
            <h2>{title}</h2>
            {text && <p>{text}</p>}
            {children}
        </div>
    );
}

/* ==========================================================================
   Page
   ========================================================================== */
export default function MyProfile() {
    const navigate = useNavigate();
    const [viewerIndex, setViewerIndex] = useState(null);

    const {
        profile,
        profileStatus,
        completionPercentage,
        isLoading,
        error,
        refreshProfile,
    } = useProfile();

    const pageRef = useRef(null);
    const navRef = useRef(null);
    const asideRef = useRef(null);
    const [activeSection, navStuck, scrollToSection] = useSectionNav(pageRef, navRef, Boolean(profile));
    const asidePinned = usePinnedAside(asideRef, pageRef, Boolean(profile));

    const photos = profile?.photos || {};
    const mainPhoto = photos.profilePhoto?.url ? { ...photos.profilePhoto, isProfile: true } : null;
    const gallery = useMemo(
        () => (photos.gallery || []).filter((photo) => photo?.url),
        [photos.gallery]
    );
    const viewerPhotos = useMemo(
        () => (mainPhoto ? [mainPhoto, ...gallery] : gallery),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [photos.profilePhoto?.url, gallery]
    );

    const goEdit = () => navigate("/profile-setup?mode=edit");

    if (isLoading && !profile) {
        return (
            <AppLayout>
                <ProfileSkeleton />
            </AppLayout>
        );
    }

    if (error && !profile) {
        return (
            <AppLayout>
                <PageState icon="shield" title="Unable to load your profile" text={error}>
                    <Button onClick={() => refreshProfile().catch(() => { })}>Try again</Button>
                </PageState>
            </AppLayout>
        );
    }

    if (!profile) {
        return (
            <AppLayout>
                <PageState icon="heart" title="No profile yet" text="Create your matrimony profile to get started.">
                    <Button onClick={() => navigate("/profile-setup")}>Create profile</Button>
                </PageState>
            </AppLayout>
        );
    }

    const {
        profileFor,
        basic = {},
        location = {},
        education = {},
        career = {},
        family = {},
        lifestyle = {},
        introduction,
        partnerPreferences: preferences = {},
    } = profile;

    const age = calculateAge(basic.dateOfBirth);
    const percent = completionPercentage ?? profile.completionPercentage ?? 0;
    const birth = basic.birthDetails || {};
    const status = profileStatus;

    const cityLine = [location.city, location.state].filter(Boolean).join(", ");
    const jobLine = [career.jobTitle || career.occupation, career.organisation].filter(Boolean).join(" at ");

    const heroFacts = [
        ["user", age !== null ? `${age} years old` : null],
        ["heart", basic.maritalStatus],
        ["briefcase", jobLine],
        ["cap", education.qualification],
        ["pin", cityLine],
        ["language", basic.motherTongue],
        ["sparkle", [basic.religion, basic.community].filter(Boolean).join(" · ")],
    ].filter(([, text]) => text);

    const hasPreferences = Object.values(preferences).some(isFilled);
    const profilePhotoCount = viewerPhotos.length;

    const strength = Math.min(100, Math.max(0, percent));
    const heroMain = viewerPhotos[0] || null;
    const heroThumbs = viewerPhotos.slice(1, 4);
    const hiddenPhotos = Math.max(0, viewerPhotos.length - 4);

    const updatedAt = profile.updatedAt ? new Date(profile.updatedAt) : null;
    const updatedText =
        updatedAt && !Number.isNaN(updatedAt.getTime())
            ? updatedAt.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
            : null;

    const formatGender = (gender) => {
        const labels = {
            male: "Male",
            female: "Female",
            non_binary: "Non-binary",
            self_described: "Self-described",
        };

        return labels[gender] || gender;
    };

    const preferredGenders = Array.isArray(preferences.preferredGenders)
        ? preferences.preferredGenders
        : [];

    const lookingFor = [
        [
            "Partner Gender",
            preferredGenders.length
                ? preferredGenders.map(formatGender).join(", ")
                : "Doesn't matter",
        ],
        [
            "Age",
            preferences.ageMin != null && preferences.ageMax != null
                ? `${preferences.ageMin}–${preferences.ageMax}`
                : null,
        ],
        [
            "Height",
            preferences.heightMinCm != null && preferences.heightMaxCm != null
                ? `${feetAndInches(preferences.heightMinCm)}–${feetAndInches(preferences.heightMaxCm)}`
                : null,
        ],
        ["Religion", summarise(preferences.religions)],
        ["Education", summarise(preferences.educationLevels)],
        [
            "Location",
            summarise(
                isFilled(preferences.states)
                    ? preferences.states
                    : preferences.countries
            ),
        ],
    ].filter(([, value]) => value);

    const checklist = [
        { label: "Add a profile photo", done: Boolean(mainPhoto) },
        { label: "Write about yourself", done: isFilled(introduction) },
        { label: "Add hobbies & interests", done: isFilled(lifestyle.hobbies) || isFilled(lifestyle.interests) },
        { label: "Add at least 3 photos", done: profilePhotoCount >= 3 },
        { label: "Set partner preferences", done: preferences.ageMin != null && preferences.ageMax != null },
    ];


    const preferenceStats = [
        [
            "Partner Gender",
            preferredGenders.length
                ? preferredGenders.map(formatGender).join(", ")
                : "Doesn't matter",
        ],
        [
            "Age",
            preferences.ageMin != null && preferences.ageMax != null
                ? `${preferences.ageMin} – ${preferences.ageMax} yrs`
                : null,
        ],
        [
            "Height",
            preferences.heightMinCm != null && preferences.heightMaxCm != null
                ? `${feetAndInches(preferences.heightMinCm)} – ${feetAndInches(preferences.heightMaxCm)}`
                : null,
        ],
        [
            "Minimum income",
            preferences.incomeMin != null
                ? formatIncome(preferences.incomeMin)
                : null,
        ],
        ["Relocation", preferences.willingToRelocate],
    ].filter(([, value]) => value);
    return (
        <AppLayout>
            <div className="mp-page" ref={pageRef}>
                {/* ----------------------------------------------------------- Hero */}
                <header className="mp-card mp-hero">
                    <div className="mp-hero__band" />

                    <div className="mp-hero__actions">
                        <Button onClick={goEdit}>
                            <Icon name="edit" size={16} /> Edit profile
                        </Button>
                    </div>

                    <div className="mp-hero__body">
                        <div className="mp-gallery">
                            {heroMain ? (
                                <button
                                    type="button"
                                    className="mp-gallery__main"
                                    aria-label={`View ${profilePhotoCount} photo${profilePhotoCount === 1 ? "" : "s"}`}
                                    onClick={() => setViewerIndex(0)}
                                >
                                    <Photo
                                        photo={heroMain}
                                        width={560}
                                        height={700}
                                        face={Boolean(heroMain.isProfile)}
                                        eager
                                        alt={basic.fullName || "Profile photo"}
                                    />
                                    <span className="mp-gallery__pill">
                                        <Icon name="expand" size={14} />
                                        {profilePhotoCount > 1 ? `${profilePhotoCount} photos` : "View photo"}
                                    </span>
                                </button>
                            ) : (
                                <button type="button" className="mp-gallery__main mp-gallery__main--empty" onClick={goEdit}>
                                    <span className="mp-gallery__initial">{(basic.fullName || "U").charAt(0).toUpperCase()}</span>
                                    <span className="mp-gallery__pill"><Icon name="camera" size={14} /> Add photo</span>
                                </button>
                            )}

                            {heroThumbs.length > 0 && (
                                <ul className="mp-gallery__thumbs">
                                    {heroThumbs.map((photo, index) => (
                                        <li key={photo.publicId || photo.url}>
                                            <button
                                                type="button"
                                                aria-label={`Open photo ${index + 2}`}
                                                onClick={() => setViewerIndex(index + 1)}
                                            >
                                                <Photo photo={photo} width={160} height={160} alt="" />
                                                {index === heroThumbs.length - 1 && hiddenPhotos > 0 && (
                                                    <span className="mp-gallery__more">+{hiddenPhotos}</span>
                                                )}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        <div className="mp-hero__info">
                            <div className="mp-hero__chips">
                                <span className={`mp-chip mp-chip--${status}`}>
                                    {STATUS_COPY[status]?.label || "Profile"}
                                </span>
                                {profileFor && profileFor !== "Self" && (
                                    <span className="mp-chip">Profile for {profileFor.toLowerCase()}</span>
                                )}
                            </div>

                            <h1 className="mp-hero__name">
                                {basic.fullName || "Your name"}
                                {status === "approved" && (
                                    <span className="mp-verified" title="Verified profile">
                                        <Icon name="check" size={14} /> Verified
                                    </span>
                                )}
                            </h1>

                            {heroFacts.length > 0 && (
                                <ul className="mp-facts">
                                    {heroFacts.map(([icon, text]) => (
                                        <li key={icon}>
                                            <Icon name={icon} size={18} />
                                            <span>{text}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}

                            <div className="mp-meter">
                                <div className="mp-meter__head">
                                    <span>Profile Strength</span>
                                    <strong>{strength}% · {strengthLabel(strength)}</strong>
                                </div>
                                <div
                                    className="mp-meter__track"
                                    role="progressbar"
                                    aria-label="Profile strength"
                                    aria-valuemin={0}
                                    aria-valuemax={100}
                                    aria-valuenow={strength}
                                >
                                    <span style={{ width: `${strength}%` }} />
                                </div>
                                {updatedText && <p className="mp-meter__updated">Last updated {updatedText}</p>}
                            </div>
                        </div>
                    </div>

                    {lookingFor.length > 0 && (
                        <div className="mp-looking">
                            <span className="mp-looking__title"><Icon name="target" size={16} /> Looking for</span>

                            <ul className="mp-looking__list">
                                {lookingFor.map(([label, value]) => (
                                    <li key={label}><span>{label}</span> {value}</li>
                                ))}
                            </ul>

                            <button type="button" className="mp-link" onClick={() => scrollToSection("mp-preferences")}>
                                View all
                            </button>
                        </div>
                    )}
                </header>

                {/* ----------------------------------------------------------- Body */}
                <div className="mp-layout">
                    <div className="mp-main">
                        <SectionNav navRef={navRef} active={activeSection} stuck={navStuck} onSelect={scrollToSection} />

                        <Section id="mp-about" icon="sparkle" title="About me" subtitle="A little introduction" onEdit={goEdit}>
                            {isFilled(introduction) || isFilled(lifestyle.personality) ? (
                                <>
                                    {isFilled(introduction) && <p className="mp-about">{introduction}</p>}
                                    {isFilled(lifestyle.personality) && (
                                        <div className="mp-callout">
                                            <h3>Personality</h3>
                                            <p>{lifestyle.personality}</p>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <EmptyHint onAction={goEdit} actionLabel="Write introduction">
                                    Members read this first. A few warm, honest lines make a big difference.
                                </EmptyHint>
                            )}
                        </Section>

                        <Section id="mp-personal" icon="user" title="Personal & background" subtitle="Who you are and where you're from" onEdit={goEdit}>
                            <FactGroups
                                onEdit={goEdit}
                                emptyText="No personal details added yet."
                                groups={[
                                    {
                                        title: "Personal",
                                        items: [
                                            ["Profile created for", profileFor],
                                            ["Full name", basic.fullName],
                                            ["Gender", capitalise(basic.gender)],
                                            ["Date of birth", formatDate(basic.dateOfBirth)],
                                            ["Age", age !== null ? `${age} years old` : null],
                                            ["Height", basic.heightCm ? `${formatHeight(basic.heightCm)} tall` : null],
                                            ["Marital status", basic.maritalStatus],
                                        ],
                                    },
                                    {
                                        title: "Language & community",
                                        items: [
                                            ["Mother tongue", basic.motherTongue],
                                            ["Languages known", basic.languagesKnown],
                                            ["Religion", basic.religion],
                                            ["Community", basic.community],
                                            ["Sub-community", basic.subCommunity],
                                        ],
                                    },
                                    {
                                        title: "Horoscope",
                                        items: [
                                            ["Horoscope available", birth.horoscopeAvailable === true ? true : null],
                                            ["Birth star", birth.star],
                                            ["Rashi", birth.rashi],
                                            ["Dosham", meaningful(birth.dosham)],
                                        ],
                                    },
                                    {
                                        title: "Location",
                                        items: [
                                            ["Country", location.country],
                                            ["State", location.state],
                                            ["District", location.district],
                                            ["City", location.city],
                                            ["Nationality", location.nationality],
                                            ["Native place", location.nativePlace],
                                            ["Grew up in", location.grewUpIn],
                                            ["Willing to relocate", location.willingToRelocate],
                                        ],
                                    },
                                ]}
                            />
                        </Section>

                        <Section id="mp-career" icon="briefcase" title="Education & career" subtitle="Your academic and professional background" onEdit={goEdit}>
                            <FactGroups
                                onEdit={goEdit}
                                emptyText="No education or career details added yet."
                                groups={[
                                    {
                                        title: "Education",
                                        items: [
                                            ["Education level", education.educationLevel],
                                            ["Qualification", education.qualification],
                                            ["Specialization", education.specialization],
                                            ["Institution", education.institution],
                                            ["Graduation year", education.graduationYear],
                                        ],
                                    },
                                    {
                                        title: "Career",
                                        items: [
                                            ["Occupation", career.occupation],
                                            ["Job title", career.jobTitle],
                                            ["Employment type", career.employmentType],
                                            ["Organisation", career.organisation],
                                            ["Annual income", formatIncome(career.annualIncome, career.currency)],
                                            ["Work country", career.workCountry],
                                            ["Work city", career.workCity],
                                        ],
                                    },
                                ]}
                            />
                        </Section>

                        <Section id="mp-family" icon="home" title="Family" subtitle="Your family background" onEdit={goEdit}>
                            <FactGroups
                                onEdit={goEdit}
                                emptyText="No family details added yet."
                                groups={[
                                    {
                                        title: "Parents",
                                        items: [
                                            ["Father's occupation", family.fatherOccupation],
                                            ["Mother's occupation", family.motherOccupation],
                                        ],
                                    },
                                    {
                                        title: "Siblings",
                                        items: [
                                            ["Brothers", siblingText(family.brothers, family.brothersMarried)],
                                            ["Sisters", siblingText(family.sisters, family.sistersMarried)],
                                        ],
                                    },
                                    {
                                        title: "Family background",
                                        items: [
                                            ["Family type", family.familyType],
                                            ["Family values", family.familyValues],
                                            ["Family status", family.familyStatus],
                                            ["Family location", family.familyLocation],
                                        ],
                                    },
                                ]}
                            />
                        </Section>

                        <Section id="mp-lifestyle" icon="star" title="Lifestyle & interests" subtitle="How you live and what you love" onEdit={goEdit}>
                            {isFilled(lifestyle.diet) || isFilled(lifestyle.smoking) || isFilled(lifestyle.drinking) ||
                                isFilled(lifestyle.hobbies) || isFilled(lifestyle.interests) ? (
                                <>
                                    <FactGroups
                                        groups={[
                                            {
                                                title: "Habits",
                                                items: [
                                                    ["Diet", lifestyle.diet],
                                                    ["Smoking", lifestyle.smoking],
                                                    ["Drinking", lifestyle.drinking],
                                                ],
                                            },
                                        ]}
                                        emptyText=""
                                    />

                                    {isFilled(lifestyle.hobbies) && (
                                        <div className="mp-group">
                                            <h3 className="mp-group__title">Hobbies</h3>
                                            <Tags values={lifestyle.hobbies} />
                                        </div>
                                    )}

                                    {isFilled(lifestyle.interests) && (
                                        <div className="mp-group">
                                            <h3 className="mp-group__title">Interests</h3>
                                            <Tags values={lifestyle.interests} tone="violet" />
                                        </div>
                                    )}
                                </>
                            ) : (
                                <EmptyHint onAction={goEdit}>Share your habits, hobbies and interests.</EmptyHint>
                            )}
                        </Section>

                        <Section id="mp-preferences" icon="target" title="Partner preferences" subtitle="What you're looking for in a life partner" onEdit={goEdit}>
                            {hasPreferences ? (
                                <>
                                    {preferenceStats.length > 0 && (
                                        <dl className="mp-pref-stats">
                                            {preferenceStats.map(([label, value]) => (
                                                <div key={label}>
                                                    <dt>{label}</dt>
                                                    <dd>{value}</dd>
                                                </div>
                                            ))}
                                        </dl>
                                    )}

                                    {PREFERENCE_GROUPS.map((group) => (
                                        <PreferenceGroup key={group.title} group={group} preferences={preferences} />
                                    ))}

                                    {isFilled(preferences.additionalExpectations) && (
                                        <div className="mp-callout">
                                            <h3>Additional expectations</h3>
                                            <p>{preferences.additionalExpectations}</p>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <EmptyHint onAction={goEdit} actionLabel="Set preferences">
                                    Tell us about the partner you hope to meet.
                                </EmptyHint>
                            )}
                        </Section>

                        <Section id="mp-photos" icon="camera" title="My photos" subtitle="Tap a photo to view it full screen" onEdit={goEdit}>
                            {viewerPhotos.length > 0 ? (
                                <ul className="mp-photos">
                                    {viewerPhotos.map((photo, index) => (
                                        <li key={photo.publicId || photo.url} className={index === 0 && photo.isProfile ? "is-featured" : ""}>
                                            <button
                                                type="button"
                                                aria-label={photo.isProfile ? "Open profile photo" : `Open photo ${index + 1}`}
                                                onClick={() => setViewerIndex(index)}
                                            >
                                                <Photo
                                                    photo={photo}
                                                    width={photo.isProfile ? 640 : 360}
                                                    height={photo.isProfile ? 640 : 360}
                                                    face={photo.isProfile}
                                                    alt=""
                                                />
                                                {photo.isProfile && <span className="mp-photos__label">Profile photo</span>}
                                                <span className="mp-photos__expand" aria-hidden="true"><Icon name="expand" size={16} /></span>
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <EmptyHint onAction={goEdit} actionLabel="Add photos">
                                    Profiles with photos get far more attention.
                                </EmptyHint>
                            )}
                        </Section>
                    </div>

                    {/* ------------------------------------------------------- Sidebar */}
                    <aside ref={asideRef} className={`mp-aside ${asidePinned ? "is-pinned" : ""}`.trim()} aria-label="Profile summary">
                        <StrengthCard percent={percent} checklist={checklist} onEdit={goEdit} />
                        <StatusCard status={status} reviewNote={profile.reviewNote} onEdit={goEdit} />
                    </aside>
                </div>
            </div>

            <PhotoLightbox
                photos={viewerPhotos}
                index={viewerIndex}
                onIndexChange={setViewerIndex}
                onClose={() => setViewerIndex(null)}
                label={`${basic.fullName || "Profile"} photos`}
            />
        </AppLayout>
    );
}