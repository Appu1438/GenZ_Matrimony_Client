
import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ProfileField } from "../../components/profile/ProfileFields.jsx";
import {
    ALL_COMMUNITIES, ALL_QUALIFICATIONS, BIRTH_STARS, COMMUNITIES_BY_RELIGION, COUNTRY_OPTIONS,
    DIET_OPTIONS, DIET_PREFERENCE_OPTIONS, DOSHAM_OPTIONS, DRINKING_OPTIONS, EDUCATION_OPTIONS,
    EDUCATION_PREFERENCE_OPTIONS, EMPLOYMENT_OPTIONS, EMPLOYMENT_PREFERENCE_OPTIONS,
    FAMILY_STATUS_OPTIONS, FAMILY_TYPE_OPTIONS, FAMILY_VALUES_OPTIONS, GENDER_BY_RELATION,
    GENDER_OPTIONS, GENDER_PREFERENCE_OPTIONS, HABIT_PREFERENCE_OPTIONS, HOBBY_GROUPS, HOROSCOPE_RELIGIONS, INTEREST_GROUPS,
    KERALA_DISTRICTS, LANGUAGE_OPTIONS, MARITAL_STATUS_OPTIONS, NATIVE_PLACE_SUGGESTIONS,
    NOT_WORKING_TYPES, OCCUPATION_GROUPS, PARENT_OCCUPATION_SUGGESTIONS, PARTNER_RELOCATE_OPTIONS,
    PROFILE_FOR_OPTIONS, QUALIFICATIONS_BY_LEVEL, RASHIS, RELIGION_CHOICES, RELIGION_OPTIONS,
    RELOCATE_OPTIONS, SMOKING_OPTIONS, SPECIALIZATION_SUGGESTIONS, STATE_OPTIONS, YES_NO,
    citySuggestions, communityGroupsFor, formatHeight, formatIncome, isIndia, preferredCityOptions,
    readPath,
} from "./profileOptions.js";

export { readPath, writePath } from "./profileOptions.js";

/* ==========================================================================
   Step configuration
   ========================================================================== */

const ANY = "Doesn't matter";
const THIS_YEAR = new Date().getFullYear();

const religionOf = (values) => values.basic?.religion;
const prefs = (values) => values.partnerPreferences ?? {};
const isHoroscopeReligion = (values) => HOROSCOPE_RELIGIONS.includes(religionOf(values));
const isWorking = (values) => !NOT_WORKING_TYPES.includes(values.career?.employmentType);
const hasSiblings = (values, key) => Number(values.family?.[key]) > 0;
const prefsIncludeIndia = (values) => !(prefs(values).countries ?? []).length || prefs(values).countries.includes("India");

export const PROFILE_STEPS = [
    /* ------------------------------------------------------------------ 1 */
    {
        title: "Basic details",
        description: "Tell us about yourself.",
        fields: [
            {
                section: "About this profile",
                name: "profileFor", label: "Profile created for", type: "select", required: true,
                options: PROFILE_FOR_OPTIONS,
                derive: (relation) =>
                    GENDER_BY_RELATION[relation] ? { "basic.gender": GENDER_BY_RELATION[relation] } : null,
            },
            {
                section: "About this profile",
                name: "basic.fullName", label: "Full name", required: true, placeholder: "Your full name",
                resolve: (values) => values.profileFor && values.profileFor !== "Self"
                    ? { hint: "Name of the person this profile is for" } : {},
            },
            {
                section: "About this profile",
                name: "basic.gender", label: "Gender", type: "choice", required: true,
                options: GENDER_OPTIONS,
            },
            {
                section: "About this profile",
                name: "basic.genderDescription",
                label: "Please describe your gender",
                placeholder: "Enter your gender",
                required: true,
                showIf: (values) => values.basic?.gender === "self_described",
            },
            {
                section: "About this profile",
                name: "basic.dateOfBirth", label: "Date of birth", type: "date",
                required: true, hint: "You must be at least 18",
            },
            {
                section: "About this profile",
                name: "basic.heightCm", label: "Height", type: "number",
                required: true, min: 100, max: 250,
                suffix: "cm", placeholder: "170", hint: (value) => formatHeight(value),
            },
            {
                section: "About this profile",
                name: "basic.maritalStatus", label: "Marital status",
                type: "choice", required: true, options: MARITAL_STATUS_OPTIONS, wide: true,
            },

            {
                section: "Language & community",
                name: "basic.motherTongue", label: "Mother tongue",
                type: "select", required: true,
                options: LANGUAGE_OPTIONS, allowOther: true,
                derive: (language, values) => {
                    const known = values.basic?.languagesKnown;
                    return Array.isArray(known) && known.includes(language)
                        ? { "basic.languagesKnown": known.filter((item) => item !== language) } : null;
                },
            },
            {
                section: "Language & community",
                name: "basic.languagesKnown", label: "Other languages you speak",
                type: "multi-select",
                allowCustom: true, options: LANGUAGE_OPTIONS,
                resolve: (values) => ({
                    options: LANGUAGE_OPTIONS.filter((language) => language !== values.basic?.motherTongue),
                }),
            },
            {
                section: "Language & community",
                name: "basic.religion", label: "Religion",
                type: "select", options: RELIGION_OPTIONS,
                allowOther: true, clears: ["basic.community"],
            },
            {
                section: "Language & community",
                name: "basic.community", label: "Community",
                type: "select", allowOther: true,
                options: communityGroupsFor([]),
                resolve: (values) => {
                    const religion = religionOf(values);
                    if (COMMUNITIES_BY_RELIGION[religion]) {
                        return { options: COMMUNITIES_BY_RELIGION[religion] };
                    }
                    if (religion && religion !== "Prefer not to say") {
                        return { type: "text", placeholder: "Your community (optional)" };
                    }
                    return {};
                },
            },
            {
                section: "Language & community",
                name: "basic.subCommunity", label: "Sub-community",
                placeholder: "Optional",
            },

            {
                section: "Horoscope", showIf: isHoroscopeReligion,
                name: "basic.birthDetails.horoscopeAvailable",
                label: "Horoscope available", type: "choice", options: YES_NO,
            },
            {
                section: "Horoscope", showIf: isHoroscopeReligion,
                name: "basic.birthDetails.dosham", label: "Dosham",
                type: "choice", options: DOSHAM_OPTIONS, wide: true,
            },
            {
                section: "Horoscope", showIf: isHoroscopeReligion,
                name: "basic.birthDetails.star", label: "Birth star (nakshatra)",
                type: "select", options: BIRTH_STARS,
            },
            {
                section: "Horoscope", showIf: isHoroscopeReligion,
                name: "basic.birthDetails.rashi", label: "Rashi (moon sign)",
                type: "select", options: RASHIS,
            },
        ],
    },

    /* ------------------------------------------------------------------ 2 */
    {
        title: "Location",
        description: "Where are you currently based?",
        fields: [
            {
                section: "Where you live now",
                name: "location.country", label: "Country",
                type: "select", required: true,
                options: COUNTRY_OPTIONS, allowOther: true,
                clears: ["location.state", "location.district", "location.city"],
            },
            {
                section: "Where you live now",
                name: "location.state", label: "State",
                type: "select", required: true,
                options: STATE_OPTIONS,
                clears: ["location.district", "location.city"],
                resolve: (values) => isIndia(values.location?.country)
                    ? {} : { type: "text", label: "State / province", placeholder: "Your state or province" },
            },
            {
                section: "Where you live now",
                name: "location.district", label: "District",
                required: true, placeholder: "District or area",
                resolve: (values) => isIndia(values.location?.country) && values.location?.state === "Kerala"
                    ? { type: "select", options: KERALA_DISTRICTS } : {},
            },
            {
                section: "Where you live now",
                name: "location.city", label: "City / Town",
                type: "combobox", required: true,
                placeholder: "Start typing to see suggestions",
                resolve: (values) => ({
                    options: citySuggestions(values.location?.country, values.location?.state),
                }),
            },
            {
                section: "Where you live now",
                name: "location.nationality", label: "Nationality",
                placeholder: "e.g. Indian",
            },

            {
                section: "Your roots",
                name: "location.nativePlace", label: "Native place",
                type: "combobox", options: NATIVE_PLACE_SUGGESTIONS,
                placeholder: "Where your family is originally from",
            },
            {
                section: "Your roots",
                name: "location.grewUpIn", label: "Grew up in",
                type: "combobox", options: NATIVE_PLACE_SUGGESTIONS,
                placeholder: "City or town",
            },
            {
                section: "Your roots",
                name: "location.willingToRelocate", label: "Willing to relocate?",
                type: "choice", options: RELOCATE_OPTIONS, wide: true,
            },
        ],
    },

    /* ------------------------------------------------------------------ 3 */
    {
        title: "Education & career",
        description: "Share your academic and professional background.",
        fields: [
            {
                section: "Education",
                name: "education.educationLevel", label: "Education level",
                type: "select", required: true, options: EDUCATION_OPTIONS,
            },
            {
                section: "Education",
                name: "education.qualification", label: "Qualification",
                type: "combobox", required: true,
                placeholder: "e.g. B.Tech / B.E, MBA, MBBS",
                resolve: (values) => ({
                    options: QUALIFICATIONS_BY_LEVEL[values.education?.educationLevel] ?? ALL_QUALIFICATIONS,
                }),
            },
            {
                section: "Education",
                name: "education.specialization", label: "Specialization",
                type: "combobox", options: SPECIALIZATION_SUGGESTIONS,
                placeholder: "e.g. Computer Science",
            },
            {
                section: "Education",
                name: "education.institution", label: "Institution",
                placeholder: "College or university",
            },
            {
                section: "Education",
                name: "education.graduationYear", label: "Graduation year",
                type: "number", min: 1950, placeholder: "e.g. 2022",
                resolve: () => ({ max: THIS_YEAR + 6 }),
            },

            {
                section: "Career",
                name: "career.occupation", label: "Occupation",
                type: "select", required: true, options: OCCUPATION_GROUPS, allowOther: true,
            },
            {
                section: "Career",
                name: "career.employmentType", label: "Employment type",
                type: "select", required: true, options: EMPLOYMENT_OPTIONS,
            },
            {
                section: "Career", showIf: isWorking,
                name: "career.jobTitle", label: "Job title",
                placeholder: "e.g. Senior Engineer",
            },
            {
                section: "Career", showIf: isWorking,
                name: "career.organisation", label: "Company / Organisation",
            },
            {
                section: "Career",
                name: "career.annualIncome", label: "Annual income",
                type: "number", min: 0,
                prefix: "₹", placeholder: "600000",
                hint: (value) => formatIncome(value),
            },
            {
                section: "Career", showIf: isWorking,
                name: "career.workCountry", label: "Work country",
                type: "combobox", options: COUNTRY_OPTIONS,
                placeholder: "Country you work in",
            },
            {
                section: "Career", showIf: isWorking,
                name: "career.workCity", label: "Work city",
                type: "combobox", placeholder: "City you work in",
                resolve: (values) => ({
                    options: citySuggestions(values.career?.workCountry),
                }),
            },
        ],
    },

    /* ------------------------------------------------------------------ 4 */
    {
        title: "Family details",
        description: "Tell us about your family background.",
        fields: [
            {
                section: "Parents",
                name: "family.fatherOccupation", label: "Father's occupation",
                type: "combobox", required: true,
                options: PARENT_OCCUPATION_SUGGESTIONS,
                placeholder: "Select or type",
            },
            {
                section: "Parents",
                name: "family.motherOccupation", label: "Mother's occupation",
                type: "combobox", required: true,
                options: PARENT_OCCUPATION_SUGGESTIONS,
                placeholder: "Select or type",
            },

            {
                section: "Siblings",
                name: "family.brothers", label: "Number of brothers",
                type: "stepper", min: 0, max: 15,
                derive: (count, values) =>
                    values.family?.brothersMarried > (count ?? 0)
                        ? { "family.brothersMarried": count } : null,
            },
            {
                section: "Siblings",
                showIf: (values) => hasSiblings(values, "brothers"),
                name: "family.brothersMarried", label: "Married brothers",
                type: "stepper", min: 0, maxField: "family.brothers",
            },
            {
                section: "Siblings",
                name: "family.sisters", label: "Number of sisters",
                type: "stepper", min: 0, max: 15,
                derive: (count, values) =>
                    values.family?.sistersMarried > (count ?? 0)
                        ? { "family.sistersMarried": count } : null,
            },
            {
                section: "Siblings",
                showIf: (values) => hasSiblings(values, "sisters"),
                name: "family.sistersMarried", label: "Married sisters",
                type: "stepper", min: 0, maxField: "family.sisters",
            },

            {
                section: "Family background",
                name: "family.familyType", label: "Family type",
                type: "choice", required: true, options: FAMILY_TYPE_OPTIONS,
            },
            {
                section: "Family background",
                name: "family.familyValues", label: "Family values",
                type: "choice", options: FAMILY_VALUES_OPTIONS,
            },
            {
                section: "Family background",
                name: "family.familyStatus", label: "Family status",
                type: "choice", options: FAMILY_STATUS_OPTIONS,
            },
            {
                section: "Family background",
                name: "family.familyLocation", label: "Family location",
                placeholder: "City or town where your family lives",
            },
        ],
    },

    /* ------------------------------------------------------------------ 5 */
    {
        title: "Lifestyle & about you",
        description: "Help others understand your personality and lifestyle.",
        fields: [
            {
                section: "Habits",
                name: "lifestyle.diet", label: "Diet",
                type: "choice", required: true, options: DIET_OPTIONS, wide: true,
            },
            {
                section: "Habits",
                name: "lifestyle.smoking", label: "Smoking",
                type: "choice", options: SMOKING_OPTIONS, wide: true,
            },
            {
                section: "Habits",
                name: "lifestyle.drinking", label: "Drinking",
                type: "choice", options: DRINKING_OPTIONS, wide: true,
            },

            {
                section: "Hobbies & interests",
                name: "lifestyle.hobbies",
                label: "Hobbies — things you enjoy doing",
                type: "multi-select",
                options: HOBBY_GROUPS, allowCustom: true, max: 10,
            },
            {
                section: "Hobbies & interests",
                name: "lifestyle.interests",
                label: "Interests — topics you care about",
                type: "multi-select",
                options: INTEREST_GROUPS, allowCustom: true, max: 10,
            },

            {
                section: "About you",
                name: "lifestyle.personality", label: "Describe your personality",
                type: "textarea", maxLength: 500,
                placeholder: "Tell us a little about your personality.",
            },
            {
                section: "About you",
                name: "introduction", label: "About yourself",
                type: "textarea", required: true, maxLength: 1000,
                placeholder: "Your interests, values, lifestyle and what a good day looks like for you.",
            },
        ],
    },

    /* ------------------------------------------------------------------ 6 */
    {
        title: "Partner preferences",
        description: "Describe the partner you hope to meet. Leave a section on “Doesn't matter” if you're open to anyone.",
        fields: [
            {
                section: "Age & height",
                name: "partnerPreferences.ageMin", label: "Minimum age",
                type: "number", required: true, min: 18, max: 100,
                suffix: "years", placeholder: "24",
            },
            {
                section: "Age & height",
                name: "partnerPreferences.ageMax", label: "Maximum age",
                type: "number", required: true, min: 18, max: 100,
                suffix: "years", placeholder: "32",
            },
            {
                section: "Age & height",
                name: "partnerPreferences.heightMinCm", label: "Minimum height",
                type: "number", min: 100, max: 250,
                suffix: "cm", hint: (value) => formatHeight(value),
            },
            {
                section: "Age & height",
                name: "partnerPreferences.heightMaxCm", label: "Maximum height",
                type: "number", min: 100, max: 250,
                suffix: "cm", hint: (value) => formatHeight(value),
            },

            // Partner gender preferences
            {
                section: "Background",
                name: "partnerPreferences.preferredGenders",
                label: "Gender",
                type: "multi-select",
                options: GENDER_PREFERENCE_OPTIONS,
                anyLabel: ANY,
            },
            {
                section: "Background",
                name: "partnerPreferences.maritalStatuses",
                label: "Marital status",
                type: "multi-select",
                options: MARITAL_STATUS_OPTIONS,
                anyLabel: ANY,
            },
            {
                section: "Background",
                name: "partnerPreferences.religions",
                label: "Religion",
                type: "multi-select",
                options: RELIGION_CHOICES,
                anyLabel: ANY,
                derive: (religions, values) => {
                    const allowed = new Set(
                        communityGroupsFor(religions).flatMap((group) => group.items)
                    );
                    const current = values.partnerPreferences?.communities ?? [];
                    const next = current.filter(
                        (item) => allowed.has(item) || !ALL_COMMUNITIES.includes(item)
                    );
                    return next.length === current.length
                        ? null
                        : { "partnerPreferences.communities": next };
                },
            },
            {
                section: "Background",
                name: "partnerPreferences.communities",
                label: "Community",
                type: "multi-select",
                options: communityGroupsFor([]),
                allowCustom: true,
                anyLabel: ANY,
                showIf: (values) =>
                    communityGroupsFor(prefs(values).religions ?? []).length > 0,
                resolve: (values) => ({
                    options: communityGroupsFor(prefs(values).religions ?? []),
                }),
            },
            {
                section: "Background",
                name: "partnerPreferences.motherTongues",
                label: "Mother tongue",
                type: "multi-select",
                options: LANGUAGE_OPTIONS,
                allowCustom: true,
                anyLabel: ANY,
            },

            {
                section: "Education & career",
                name: "partnerPreferences.educationLevels",
                label: "Education",
                type: "multi-select",
                options: EDUCATION_PREFERENCE_OPTIONS,
                anyLabel: ANY,
            },
            {
                section: "Education & career",
                name: "partnerPreferences.occupations",
                label: "Occupation",
                type: "multi-select",
                options: OCCUPATION_GROUPS,
                allowCustom: true,
                anyLabel: ANY,
            },
            {
                section: "Education & career",
                name: "partnerPreferences.employmentTypes",
                label: "Employment type",
                type: "multi-select",
                options: EMPLOYMENT_PREFERENCE_OPTIONS,
                anyLabel: ANY,
            },
            {
                section: "Education & career",
                name: "partnerPreferences.incomeMin",
                label: "Minimum annual income",
                type: "number", min: 0, prefix: "₹",
                placeholder: "Optional",
                hint: (value) => formatIncome(value),
            },

            {
                section: "Location",
                name: "partnerPreferences.countries",
                label: "Country",
                type: "multi-select",
                options: COUNTRY_OPTIONS,
                allowCustom: true,
                anyLabel: ANY,
            },
            {
                section: "Location",
                showIf: prefsIncludeIndia,
                name: "partnerPreferences.states",
                label: "State",
                type: "multi-select",
                options: STATE_OPTIONS,
                anyLabel: ANY,
            },
            {
                section: "Location",
                name: "partnerPreferences.cities",
                label: "City",
                type: "multi-select",
                allowCustom: true,
                anyLabel: ANY,
                options: preferredCityOptions(),
                resolve: (values) => ({
                    options: preferredCityOptions(prefs(values)),
                }),
            },
            {
                section: "Location",
                name: "partnerPreferences.willingToRelocate",
                label: "Relocation",
                type: "choice",
                options: PARTNER_RELOCATE_OPTIONS,
                wide: true,
            },

            {
                section: "Lifestyle",
                name: "partnerPreferences.diets",
                label: "Diet",
                type: "multi-select",
                options: DIET_PREFERENCE_OPTIONS,
                anyLabel: ANY,
            },
            {
                section: "Lifestyle",
                name: "partnerPreferences.smokingPreferences",
                label: "Smoking",
                type: "multi-select",
                options: HABIT_PREFERENCE_OPTIONS,
                anyLabel: ANY,
            },
            {
                section: "Lifestyle",
                name: "partnerPreferences.drinkingPreferences",
                label: "Drinking",
                type: "multi-select",
                options: HABIT_PREFERENCE_OPTIONS,
                anyLabel: ANY,
            },

            {
                section: "Anything else",
                name: "partnerPreferences.additionalExpectations",
                label: "Additional expectations",
                type: "textarea",
                maxLength: 1000,
                placeholder: "Anything else important to you?",
            },
        ],
    },

    /* ------------------------------------------------------------------ 7 */
    {
        title: "Photos & review",
        description: "Add your profile photo and review your details.",
        fields: [],
        note:
            "Add a clear profile photo. You can also add up to five additional photos. Your profile will not be visible to other members until an administrator approves it.",
    },
];

/**
 * Fields of a step after applying `resolve` overrides and `showIf` rules.
 * Used for both rendering and validation so they never disagree.
 */
export function getVisibleFields(stepIndex, values) {
    return PROFILE_STEPS[stepIndex].fields
        .map((field) => ({ ...field, ...(field.resolve?.(values) ?? {}) }))
        .filter((field) => !field.showIf || field.showIf(values));
}

/* ==========================================================================
   Step body
   ========================================================================== */
export function ProfileStepFields({ step, values, onChange, invalid = {} }) {
    const config = PROFILE_STEPS[step];
    const headingRef = useRef(null);
    const previousStep = useRef(step);
    const fields = getVisibleFields(step, values);

    // Move focus to the new step's heading so keyboard / screen-reader users
    // land on the new content after "Save and continue".
    useEffect(() => {
        if (previousStep.current !== step) {
            previousStep.current = step;
            headingRef.current?.focus({ preventScroll: true });
        }
    }, [step]);

    function handleChange(field, value) {
        onChange(field.name, value);
        field.clears?.forEach((path) => onChange(path, ""));
        const derived = field.derive?.(value, values);
        if (derived) {
            Object.entries(derived).forEach(([path, next]) => onChange(path, next));
        }
    }

    return (
        <motion.div
            key={step}
            className="profile-step-fields"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
            <header className="profile-step-heading">
                <h2 ref={headingRef} tabIndex={-1}>{config.title}</h2>
                <p>{config.description}</p>
            </header>

            {config.note && <p className="profile-step-note">{config.note}</p>}

            {fields.length > 0 && (
                <div className="profile-fields-grid">
                    {fields.map((field, index) => (
                        <FieldWithSection
                            key={field.name}
                            showSection={field.section && field.section !== fields[index - 1]?.section}
                            field={field}
                            value={readPath(values, field.name)}
                            values={values}
                            error={invalid[field.name]}
                            onChange={(value) => handleChange(field, value)}
                        />
                    ))}
                </div>
            )}
        </motion.div>
    );
}

function FieldWithSection({ showSection, field, ...rest }) {
    return (
        <>
            {showSection && <h3 className="profile-section-title">{field.section}</h3>}
            <ProfileField field={field} {...rest} />
        </>
    );
}
