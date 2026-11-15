import { motion } from "framer-motion";
import Logo from "../ui/Logo.jsx";
import "../../pages/onboarding/ProfileSetup.css";

const iconProps = { width: 28, height: 28, viewBox: "0 0 24 24", fill: "none" };
const strokeProps = { stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round" };

const VARIANTS = {
    pending: {
        badge: "Under review",
        icon: (
            <svg {...iconProps}>
                <circle cx="12" cy="12" r="9" {...strokeProps} />
                <path d="M12 7v5l3 2" {...strokeProps} />
            </svg>
        ),
    },
    "needs-changes": {
        badge: "Changes requested",
        icon: (
            <svg {...iconProps}>
                <path d="M4 20h4l10.5-10.5a2.1 2.1 0 0 0-3-3L5 17v3Z" {...strokeProps} />
                <path d="M13.5 8.5l2 2" {...strokeProps} />
            </svg>
        ),
    },
    rejected: {
        badge: "Not approved",
        icon: (
            <svg {...iconProps}>
                <circle cx="12" cy="12" r="9" {...strokeProps} />
                <path d="M9 9l6 6M15 9l-6 6" {...strokeProps} />
            </svg>
        ),
    },
    approved: {
        badge: "Approved",
        icon: (
            <svg {...iconProps}>
                <circle cx="12" cy="12" r="9" {...strokeProps} />
                <path d="m8 12 2.5 2.5L16 9" {...strokeProps} />
            </svg>
        ),
    },
};

/**
 * Shared shell for the profile review status screens
 * (pending / needs changes / rejected).
 */
export default function ProfileStatusCard({ variant, title, children }) {
    const { badge, icon } = VARIANTS[variant];

    return (
        <main className="profile-status-page">
            {/* <header className="profile-topbar">
                <Logo size="sm" />
            </header> */}

            <motion.section
                className={`profile-status-card profile-status-card--${variant}`}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
                <span className="profile-status-icon" aria-hidden="true">{icon}</span>
                <span className="profile-status-badge">{badge}</span>
                <h1>{title}</h1>
                {children}
            </motion.section>
        </main>
    );
}