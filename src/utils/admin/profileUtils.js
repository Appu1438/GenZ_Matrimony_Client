// Shared helpers for the admin Profiles page, table and review modal.

export const formatDate = (value, includeTime = false) => {
    if (!value) return "—";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "—";

    return date.toLocaleString(
        "en-IN",
        includeTime
            ? {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            }
            : {
                day: "2-digit",
                month: "short",
                year: "numeric",
            }
    );
};

export const getAgeNumber = (dateOfBirth) => {
    if (!dateOfBirth) return null;

    const dob = new Date(dateOfBirth);
    if (Number.isNaN(dob.getTime())) return null;

    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();

    if (today < new Date(today.getFullYear(), dob.getMonth(), dob.getDate())) {
        age--;
    }

    return age >= 0 ? age : null;
};

export const getAge = (dateOfBirth, unit = "yrs") => {
    const age = getAgeNumber(dateOfBirth);
    return age === null ? "—" : `${age} ${unit}`;
};

export const humanize = (value = "") =>
    String(value)
        .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
        .replace(/_/g, " ")
        .replace(/\b\w/g, (letter) => letter.toUpperCase());

export const displayValue = (value) => {
    if (value === null || value === undefined || value === "") return "—";
    if (typeof value === "boolean") return value ? "Yes" : "No";
    if (Array.isArray(value)) return value.length ? value.join(", ") : "—";
    if (typeof value === "object") return "—";
    return String(value);
};

export const clampPercent = (value) =>
    Math.min(100, Math.max(0, Number(value) || 0));

// low < 40, mid < 75, high otherwise
export const completionTone = (value) => {
    const pct = clampPercent(value);
    if (pct < 40) return "low";
    if (pct < 75) return "mid";
    return "high";
};

export const joinPlace = (...parts) => parts.filter(Boolean).join(", ");