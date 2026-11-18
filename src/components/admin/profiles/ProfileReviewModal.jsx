import { isValidElement, useEffect, useRef, useState } from "react";
import {
    X,
    ImageOff,
    ExternalLink,
    CheckCircle,
    AlertCircle,
    XCircle,
    RefreshCw,
    User,
    MapPin,
    GraduationCap,
    BriefcaseBusiness,
    Users,
    Heart,
    UserSearch,
    Image,
    ClipboardCheck,
    Sparkles,
    Star,
    History,
    UserRound,
} from "lucide-react";

import ProfileStatusBadge from "./ProfileStatusBadge";
import {
    formatDate,
    getAge,
    displayValue,
    clampPercent,
    completionTone,
    joinPlace,
} from "../../../utils/admin/profileUtils.js";

const REVIEW_ACTIONS = [
    ["approve", "Approve", CheckCircle, "green"],
    ["needs_changes", "Needs changes", AlertCircle, "blue"],
    ["reject", "Reject", XCircle, "red"],
];

const SUBMIT_LABEL = {
    approve: "Approve profile",
    needs_changes: "Request changes",
    reject: "Reject profile",
};

const PLACEHOLDER = {
    approve: "Optional remarks for approval…",
    needs_changes: "Explain what the member needs to correct…",
    reject: "Explain why this profile is being rejected…",
};

const NAV = [
    ["photos", "Photos"],
    ["about", "About"],
    ["basics", "Basics"],
    ["horoscope", "Horoscope"],
    ["location", "Location"],
    ["education", "Education"],
    ["career", "Career"],
    ["family", "Family"],
    ["lifestyle", "Lifestyle"],
    ["preferences", "Preferences"],
    ["history", "History"],
];

/* ------------------------------------------------------------------ */
/* Small building blocks                                                */
/* ------------------------------------------------------------------ */

const ReviewField = ({ label, value, raw = false }) => {
    const content = isValidElement(value) ? value : displayValue(value);
    const empty = content === "—";

    return (
        <div className={`pf-field ${empty ? "is-empty" : ""} ${raw ? "is-raw" : ""}`}>
            <span>{label}</span>
            <strong>{content}</strong>
        </div>
    );
};

const ReviewGrid = ({ children }) => <div className="pf-grid">{children}</div>;

const ReviewSection = ({ id, title, icon: Icon, count, wide = false, children }) => (
    <section
        id={`pf-sec-${id}`}
        data-section={id}
        className={`pf-section ${wide ? "pf-section--wide" : ""}`}
    >
        <h3>
            {Icon && (
                <span className="pf-section-icon">
                    <Icon size={16} />
                </span>
            )}
            <span className="pf-section-title">{title}</span>
            {count !== undefined && <em>{count}</em>}
        </h3>
        {children}
    </section>
);

const ChipGroup = ({ title, values }) => {
    if (!Array.isArray(values) || values.length === 0) return null;

    return (
        <div className="pf-subsection">
            <h4>{title}</h4>
            <div className="pf-chip-list">
                {values.map((item, index) => (
                    <span key={`${item}-${index}`} className="pf-chip">
                        {displayValue(item)}
                    </span>
                ))}
            </div>
        </div>
    );
};

const CompletionRing = ({ value }) => {
    const radius = 26;
    const circumference = 2 * Math.PI * radius;

    return (
        <div
            className={`pf-ring pf-ring--${completionTone(value)}`}
            role="img"
            aria-label={`Profile ${value}% complete`}
        >
            <svg viewBox="0 0 64 64" width="64" height="64" aria-hidden="true">
                <circle className="pf-ring-track" cx="32" cy="32" r={radius} />
                <circle
                    className="pf-ring-bar"
                    cx="32"
                    cy="32"
                    r={radius}
                    strokeDasharray={circumference}
                    strokeDashoffset={circumference * (1 - value / 100)}
                    transform="rotate(-90 32 32)"
                />
            </svg>
            <b>{value}%</b>
        </div>
    );
};

const range = (min, max, unit = "") => {
    const hasMin = min !== undefined && min !== null && min !== "";
    const hasMax = max !== undefined && max !== null && max !== "";

    if (!hasMin && !hasMax) return "—";
    if (hasMin && hasMax) return `${min} – ${max}${unit ? ` ${unit}` : ""}`;
    return hasMin
        ? `${min}+${unit ? ` ${unit}` : ""}`
        : `Up to ${max}${unit ? ` ${unit}` : ""}`;
};

/* ------------------------------------------------------------------ */
/* Modal                                                                */
/* ------------------------------------------------------------------ */

const ProfileReviewModal = ({
    profile,
    loading,
    reviewAction,
    reviewNote,
    reviewLoading,
    reviewError,
    onClose,
    onActionChange,
    onNoteChange,
    onSubmit,
    onViewMember,
}) => {
    const bodyRef = useRef(null);
    const navRef = useRef(null);
    const [activeSection, setActiveSection] = useState(NAV[0][0]);

    const basic = profile?.basic || {};
    const location = profile?.location || {};
    const education = profile?.education || {};
    const career = profile?.career || {};
    const family = profile?.family || {};
    const lifestyle = profile?.lifestyle || {};
    const preferences = profile?.partnerPreferences || {};
    const birth = basic.birthDetails || {};
    const photos = profile?.photos || {};

    const photoList = [
        ...(photos.profilePhoto?.url
            ? [{ ...photos.profilePhoto, isProfile: true }]
            : []),
        ...(photos.gallery || []),
    ].filter((photo) => photo?.url);

    const completion = clampPercent(profile?.completionPercentage);

    const income =
        career.annualIncome != null
            ? `${career.currency || "INR"} ${Number(career.annualIncome).toLocaleString("en-IN")}`
            : "—";

    const cm = (value) => (value != null ? `${value} cm` : "—");

    const memberId =
        profile?.user?._id ||
        (typeof profile?.user === "string" ? profile.user : null);

    const place = joinPlace(location.city, location.state);

    const heroChips = [
        basic.maritalStatus,
        basic.religion,
        basic.community,
        basic.motherTongue,
    ].filter(Boolean);

    const prefGroups = [
        ["Genders", preferences.preferredGenders],
        ["Marital status", preferences.maritalStatuses],
        ["Religions", preferences.religions],
        ["Communities", preferences.communities],
        ["Mother tongues", preferences.motherTongues],
        ["Education", preferences.educationLevels],
        ["Occupations", preferences.occupations],
        ["Employment", preferences.employmentTypes],
        ["Countries", preferences.countries],
        ["States", preferences.states],
        ["Cities", preferences.cities],
        ["Diet", preferences.diets],
        ["Smoking", preferences.smokingPreferences],
        ["Drinking", preferences.drinkingPreferences],
    ].filter(([, values]) => Array.isArray(values) && values.length > 0);

    // Highlight the nav chip for the section currently in view.
    useEffect(() => {
        const root = bodyRef.current;
        if (!root || loading || !profile || !("IntersectionObserver" in window)) {
            return undefined;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                const visible = entries
                    .filter((entry) => entry.isIntersecting)
                    .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

                if (visible[0]) setActiveSection(visible[0].target.dataset.section);
            },
            { root, rootMargin: "-15% 0px -70% 0px", threshold: 0 }
        );

        NAV.forEach(([id]) => {
            const el = root.querySelector(`[data-section="${id}"]`);
            if (el) observer.observe(el);
        });

        return () => observer.disconnect();
    }, [loading, profile]);

    // Keep the active chip visible in the horizontally scrolling nav.
    useEffect(() => {
        const nav = navRef.current;
        const chip = nav?.querySelector(".is-active");
        if (!nav || !chip) return;

        nav.scrollTo({
            left: chip.offsetLeft - nav.clientWidth / 2 + chip.clientWidth / 2,
            behavior: "smooth",
        });
    }, [activeSection]);

    const jumpTo = (id) => {
        setActiveSection(id);
        bodyRef.current
            ?.querySelector(`[data-section="${id}"]`)
            ?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    const ready = !loading && profile;

    return (
        <div
            className="ad-backdrop pf-backdrop"
            role="presentation"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget && !reviewLoading) {
                    onClose();
                }
            }}
        >
            <div
                className="pf-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="pf-modal-title"
            >
                {/* HEADER */}
                <header className="pf-modal-head">
                    <div>
                        <span>Profile Review</span>
                        <h2 id="pf-modal-title">
                            {basic.fullName || "Profile details"}
                        </h2>
                    </div>

                    <button
                        type="button"
                        className="ad-icon-btn"
                        onClick={onClose}
                        disabled={reviewLoading}
                        aria-label="Close"
                    >
                        <X size={18} />
                    </button>
                </header>

                {!ready ? (
                    <div className="pf-modal-loading">
                        <RefreshCw className="ad-spin" size={20} />
                        Loading profile…
                    </div>
                ) : (
                    <>
                        <div className="pf-modal-body" ref={bodyRef}>
                            {/* HERO */}
                            <div className="pf-hero">
                                <div className="pf-hero-banner" aria-hidden="true" />

                                <div className="pf-hero-main">
                                    {photos.profilePhoto?.url ? (
                                        <img
                                            className="pf-hero-photo"
                                            src={photos.profilePhoto.url}
                                            alt={basic.fullName || "Profile"}
                                        />
                                    ) : (
                                        <span className="pf-hero-photo pf-hero-photo--empty">
                                            <ImageOff size={26} />
                                        </span>
                                    )}

                                    <div className="pf-hero-info">
                                        <div className="pf-hero-name">
                                            <h3>{basic.fullName || "Unnamed profile"}</h3>
                                            <ProfileStatusBadge status={profile.status} />
                                        </div>

                                        <p className="pf-hero-email">
                                            {profile.user?.email || "—"}
                                        </p>

                                        <ul className="pf-hero-facts">
                                            <li>
                                                <UserRound size={14} />
                                                <span className="pf-cap">
                                                    {[basic.gender, getAge(basic.dateOfBirth, "years")]
                                                        .filter((v) => v && v !== "—")
                                                        .join(", ") || "—"}
                                                </span>
                                            </li>
                                            <li>
                                                <MapPin size={14} />
                                                {place || "—"}
                                            </li>
                                            {profile.profileFor && (
                                                <li>
                                                    <Users size={14} />
                                                    <span className="pf-cap">
                                                        For {profile.profileFor}
                                                    </span>
                                                </li>
                                            )}
                                        </ul>

                                        {/* {heroChips.length > 0 && (
                                            <div className="pf-chip-list pf-hero-chips">
                                                {heroChips.map((chip, i) => (
                                                    <span key={`${chip}-${i}`} className="pf-chip">
                                                        {chip}
                                                    </span>
                                                ))}
                                            </div>
                                        )} */}
                                    </div>

                                    <div className="pf-hero-aside">
                                        <div className="pf-hero-complete">
                                            <CompletionRing value={completion} />
                                            <span>Complete</span>
                                        </div>

                                        {/* {memberId && (
                                            <button
                                                type="button"
                                                className="ad-btn ad-btn--ghost pf-member-link"
                                                onClick={() => onViewMember(memberId)}
                                            >
                                                <ExternalLink size={15} />
                                                View member
                                            </button>
                                        )} */}
                                    </div>
                                </div>
                            </div>

                            {/* SECTION NAV */}
                            <nav className="pf-nav" ref={navRef} aria-label="Profile sections">
                                {NAV.map(([id, label]) => (
                                    <button
                                        key={id}
                                        type="button"
                                        className={activeSection === id ? "is-active" : ""}
                                        onClick={() => jumpTo(id)}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </nav>

                            {/* SECTIONS */}
                            <div className="pf-sections">
                                <ReviewSection
                                    id="photos"
                                    title="Photos"
                                    icon={Image}
                                    count={photoList.length}
                                    wide
                                >
                                    {photoList.length === 0 ? (
                                        <p className="pf-muted">No photos uploaded.</p>
                                    ) : (
                                        <div className="pf-photos">
                                            {photoList.map((photo, index) => (
                                                <a
                                                    key={photo.publicId || photo.url}
                                                    href={photo.url}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    aria-label={`Open photo ${index + 1}`}
                                                >
                                                    <img
                                                        src={photo.url}
                                                        alt={`Profile ${index + 1}`}
                                                        loading="lazy"
                                                    />
                                                    {photo.isProfile && (
                                                        <span className="pf-photo-badge">
                                                            <Star size={11} />
                                                            Profile photo
                                                        </span>
                                                    )}
                                                </a>
                                            ))}
                                        </div>
                                    )}
                                </ReviewSection>

                                <ReviewSection id="about" title="About" icon={Sparkles} wide>
                                    {profile.introduction ? (
                                        <p className="pf-intro">{profile.introduction}</p>
                                    ) : (
                                        <p className="pf-muted">No introduction provided.</p>
                                    )}
                                </ReviewSection>

                                <ReviewSection id="basics" title="Basic information" icon={User} wide>
                                    <ReviewGrid>
                                        <ReviewField label="Full name" value={basic.fullName} />
                                        <ReviewField label="Gender" value={basic.gender} />
                                        {basic.gender === "self_described" && (
                                            <ReviewField
                                                label="Gender description"
                                                value={basic.genderDescription}
                                            />
                                        )}
                                        <ReviewField
                                            label="Date of birth"
                                            value={formatDate(basic.dateOfBirth)}
                                        />
                                        <ReviewField label="Age" value={getAge(basic.dateOfBirth, "years")} />
                                        <ReviewField label="Height" value={cm(basic.heightCm)} />
                                        <ReviewField label="Marital status" value={basic.maritalStatus} />
                                        <ReviewField label="Mother tongue" value={basic.motherTongue} />
                                        <ReviewField label="Religion" value={basic.religion} />
                                        <ReviewField label="Community" value={basic.community} />
                                        <ReviewField label="Sub-community" value={basic.subCommunity} />
                                    </ReviewGrid>

                                    <ChipGroup title="Languages known" values={basic.languagesKnown} />
                                </ReviewSection>

                                <ReviewSection id="horoscope" title="Birth & horoscope" icon={Sparkles}>
                                    <ReviewGrid>
                                        <ReviewField label="Birth time" value={birth.time} raw />
                                        <ReviewField label="Birth place" value={birth.place} />
                                        <ReviewField label="Star" value={birth.star} />
                                        <ReviewField label="Rashi" value={birth.rashi} />
                                        <ReviewField
                                            label="Horoscope available"
                                            value={birth.horoscopeAvailable}
                                        />
                                        <ReviewField label="Dosham" value={birth.dosham} />
                                    </ReviewGrid>
                                </ReviewSection>

                                <ReviewSection id="location" title="Location" icon={MapPin}>
                                    <ReviewGrid>
                                        <ReviewField label="Country" value={location.country} />
                                        <ReviewField label="State" value={location.state} />
                                        <ReviewField label="District" value={location.district} />
                                        <ReviewField label="City" value={location.city} />
                                        <ReviewField label="Nationality" value={location.nationality} />
                                        <ReviewField label="Native place" value={location.nativePlace} />
                                        <ReviewField label="Grew up in" value={location.grewUpIn} />
                                        <ReviewField
                                            label="Willing to relocate"
                                            value={location.willingToRelocate}
                                        />
                                    </ReviewGrid>
                                </ReviewSection>

                                <ReviewSection id="education" title="Education" icon={GraduationCap}>
                                    <ReviewGrid>
                                        <ReviewField label="Education level" value={education.educationLevel} />
                                        <ReviewField label="Qualification" value={education.qualification} />
                                        <ReviewField label="Specialization" value={education.specialization} />
                                        <ReviewField label="Institution" value={education.institution} />
                                        <ReviewField label="Graduation year" value={education.graduationYear} />
                                    </ReviewGrid>
                                </ReviewSection>

                                <ReviewSection id="career" title="Career" icon={BriefcaseBusiness}>
                                    <ReviewGrid>
                                        <ReviewField label="Occupation" value={career.occupation} />
                                        <ReviewField label="Job title" value={career.jobTitle} />
                                        <ReviewField label="Organisation" value={career.organisation} />
                                        <ReviewField label="Employment type" value={career.employmentType} />
                                        <ReviewField label="Annual income" value={income} raw />
                                        <ReviewField label="Work country" value={career.workCountry} />
                                        <ReviewField label="Work city" value={career.workCity} />
                                    </ReviewGrid>
                                </ReviewSection>

                                <ReviewSection id="family" title="Family" icon={Users}>
                                    <ReviewGrid>
                                        <ReviewField label="Father's occupation" value={family.fatherOccupation} />
                                        <ReviewField label="Mother's occupation" value={family.motherOccupation} />
                                        <ReviewField label="Brothers" value={family.brothers} />
                                        <ReviewField label="Brothers married" value={family.brothersMarried} />
                                        <ReviewField label="Sisters" value={family.sisters} />
                                        <ReviewField label="Sisters married" value={family.sistersMarried} />
                                        <ReviewField label="Family type" value={family.familyType} />
                                        <ReviewField label="Family status" value={family.familyStatus} />
                                        <ReviewField label="Family values" value={family.familyValues} />
                                        <ReviewField label="Family location" value={family.familyLocation} />
                                    </ReviewGrid>
                                </ReviewSection>

                                <ReviewSection id="lifestyle" title="Lifestyle" icon={Heart}>
                                    <ReviewGrid>
                                        <ReviewField label="Diet" value={lifestyle.diet} />
                                        <ReviewField label="Smoking" value={lifestyle.smoking} />
                                        <ReviewField label="Drinking" value={lifestyle.drinking} />
                                        <ReviewField label="Personality" value={lifestyle.personality} />
                                    </ReviewGrid>

                                    <ChipGroup title="Hobbies" values={lifestyle.hobbies} />
                                    <ChipGroup title="Interests" values={lifestyle.interests} />
                                </ReviewSection>

                                <ReviewSection
                                    id="preferences"
                                    title="Partner preferences"
                                    icon={UserSearch}
                                    wide
                                >
                                    <ReviewGrid>
                                        <ReviewField
                                            label="Age range"
                                            value={range(preferences.ageMin, preferences.ageMax, "years")}
                                        />
                                        <ReviewField
                                            label="Height range"
                                            value={range(preferences.heightMinCm, preferences.heightMaxCm, "cm")}
                                        />
                                        <ReviewField
                                            label="Minimum income"
                                            value={
                                                preferences.incomeMin != null
                                                    ? Number(preferences.incomeMin).toLocaleString("en-IN")
                                                    : "—"
                                            }
                                            raw
                                        />
                                        <ReviewField
                                            label="Willing to relocate"
                                            value={preferences.willingToRelocate}
                                        />
                                    </ReviewGrid>

                                    {prefGroups.length > 0 && (
                                        <dl className="pf-prefs">
                                            {prefGroups.map(([label, values]) => (
                                                <div key={label} className="pf-pref-row">
                                                    <dt>{label}</dt>
                                                    <dd className="pf-chip-list">
                                                        {values.map((item, i) => (
                                                            <span key={`${item}-${i}`} className="pf-chip">
                                                                {displayValue(item)}
                                                            </span>
                                                        ))}
                                                    </dd>
                                                </div>
                                            ))}
                                        </dl>
                                    )}

                                    {preferences.additionalExpectations && (
                                        <div className="pf-subsection">
                                            <h4>Additional expectations</h4>
                                            <p className="pf-intro">
                                                {preferences.additionalExpectations}
                                            </p>
                                        </div>
                                    )}
                                </ReviewSection>

                                <ReviewSection id="history" title="Record & Review history" icon={History} wide>
                                    <ReviewGrid>
                                        {/* <ReviewField label="Profile ID" value={profile._id} raw />
                                        <ReviewField label="Profile for" value={profile.profileFor} />
                                        <ReviewField label="Current step" value={profile.currentStep} /> */}
                                        <ReviewField label="Created" value={formatDate(profile.createdAt)} />
                                        <ReviewField label="Last updated" value={formatDate(profile.updatedAt)} />
                                        <ReviewField label="Submitted" value={formatDate(profile.submittedAt)} />
                                        <ReviewField
                                            label="Reviewed on"
                                            value={formatDate(profile.reviewedAt, true)}
                                        />
                                        {/* <ReviewField
                                            label="Approved on"
                                            value={formatDate(profile.approvedAt, true)}
                                        /> */}
                                        <ReviewField
                                            label="Reviewed by"
                                            value={profile.reviewedBy?.fullName || profile.reviewedBy?.email}
                                            raw
                                        />
                                    </ReviewGrid>

                                    {profile.reviewNote ? (
                                        <div className="pf-remark">
                                            <strong>Previous review remarks</strong>
                                            <p>{profile.reviewNote}</p>
                                        </div>
                                    ) : (
                                        <p className="pf-muted pf-muted--gap">
                                            No previous review remarks.
                                        </p>
                                    )}
                                </ReviewSection>
                            </div>
                        </div>

                        {/* REVIEW DECISION: always visible, no scrolling to the bottom */}
                        <footer className="pf-review">
                            <div className="pf-review-bar">
                                <div className="pf-review-title">
                                    <strong>Admin decision</strong>
                                    <span>Remarks are required to request changes or reject.</span>
                                </div>

                                <div
                                    className="pf-actions"
                                    role="radiogroup"
                                    aria-label="Review decision"
                                >
                                    {REVIEW_ACTIONS.map(([value, label, Icon, tone]) => (
                                        <button
                                            key={value}
                                            type="button"
                                            role="radio"
                                            aria-checked={reviewAction === value}
                                            className={`pf-action tone-${tone} ${
                                                reviewAction === value ? "is-selected" : ""
                                            }`}
                                            onClick={() => onActionChange(value)}
                                        >
                                            <Icon size={16} />
                                            {label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {reviewAction && (
                                <div className="pf-review-form">
                                    <label className="pf-label" htmlFor="pf-note">
                                        Remarks
                                        {reviewAction !== "approve" && <span>Required</span>}
                                    </label>

                                    <textarea
                                        id="pf-note"
                                        className="pf-textarea"
                                        rows={3}
                                        value={reviewNote}
                                        maxLength={1000}
                                        onChange={(event) => onNoteChange(event.target.value)}
                                        placeholder={PLACEHOLDER[reviewAction]}
                                    />

                                    {reviewError && (
                                        <div className="ad-alert pf-inline-alert" role="alert">
                                            {reviewError}
                                        </div>
                                    )}

                                    <div className="pf-review-foot">
                                        <span className="pf-counter">{reviewNote.length}/1000</span>

                                        <button
                                            type="button"
                                            className={`ad-btn ad-btn--primary pf-submit ${
                                                reviewAction === "reject" ? "is-danger" : ""
                                            }`}
                                            onClick={onSubmit}
                                            disabled={
                                                reviewLoading ||
                                                (reviewAction !== "approve" && !reviewNote.trim())
                                            }
                                        >
                                            <ClipboardCheck size={16} />
                                            {reviewLoading ? "Updating…" : SUBMIT_LABEL[reviewAction]}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </footer>
                    </>
                )}
            </div>
        </div>
    );
};

export default ProfileReviewModal;