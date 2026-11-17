function normalizeForComparison(value) {
    if (value instanceof Date) {
        return value.toISOString();
    }

    if (Array.isArray(value)) {
        return value.map(normalizeForComparison);
    }

    if (value && typeof value === "object") {
        return Object.keys(value)
            .filter((key) => value[key] !== undefined)
            .sort()
            .reduce((result, key) => {
                result[key] = normalizeForComparison(value[key]);
                return result;
            }, {});
    }

    return value;
}

function getComparableProfile(data = {}) {
    const {
        _id,
        __v,
        user,
        status,
        reviewNote,
        reviewedBy,
        reviewedAt,
        submittedAt,
        approvedAt,
        createdAt,
        updatedAt,
        completionPercentage,
        currentStep,
        ...profileData
    } = data;

    return normalizeForComparison(profileData);
}

export function hasProfileChanges(current, original) {
    return JSON.stringify(getComparableProfile(current)) !==
        JSON.stringify(getComparableProfile(original));
}