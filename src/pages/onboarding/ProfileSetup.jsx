import { useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";

import Button from "../../components/ui/Button.jsx";
import AppLayout from "../../components/layout/AppLayout.jsx";
import { useProfile } from "../../hooks/useProfile.js";
import ProfilePhotoUpload from "../../components/profile/ProfilePhotoUpload.jsx";

import {
    PROFILE_STEPS,
    ProfileStepFields,
    getVisibleFields,
    readPath,
    writePath,
} from "./steps.jsx";

import "./ProfileSetup.css";

const emptyProfile = {
    profileFor: "Self",
    basic: {
        birthDetails: {
            horoscopeAvailable: false,
            dosham: "Prefer not to say",
        },
    },
    location: {
        country: "India",
        willingToRelocate: "Depends",
    },
    education: {},
    career: {
        currency: "INR",
    },
    family: {},
    lifestyle: {},
    partnerPreferences: {
        willingToRelocate: "Doesn't matter",
    },
    photos: {
        profilePhoto: null,
        gallery: [],
    },
    introduction: "",
    currentStep: 0,
};

function mergeProfileData(defaults, saved) {
    const result = { ...defaults, ...saved };

    for (const key of Object.keys(defaults)) {
        const defaultValue = defaults[key];
        const savedValue = saved?.[key];

        if (
            defaultValue &&
            typeof defaultValue === "object" &&
            !Array.isArray(defaultValue)
        ) {
            result[key] = {
                ...defaultValue,
                ...(savedValue || {}),
            };
        }
    }

    return result;
}

function getAge(dateOfBirth) {
    if (!dateOfBirth) return null;

    const dob = new Date(dateOfBirth);

    if (!Number.isFinite(dob.getTime())) return null;

    const today = new Date();

    let age = today.getFullYear() - dob.getFullYear();

    const beforeBirthday =
        today.getMonth() < dob.getMonth() ||
        (
            today.getMonth() === dob.getMonth() &&
            today.getDate() < dob.getDate()
        );

    if (beforeBirthday) age--;

    return age;
}

const isEmpty = (value) =>
    value === undefined ||
    value === null ||
    value === "" ||
    (Array.isArray(value) && value.length === 0);

function rangeMessage(label, min, max) {
    if (min != null && max != null) {
        return `${label} must be between ${min} and ${max}.`;
    }

    if (min != null) {
        return `${label} must be at least ${min}.`;
    }

    return `${label} must be at most ${max}.`;
}

/** Returns [{ name, message }] — name is the field path. */
function validateStep(stepIndex, values) {
    const errors = [];

    const add = (name, message) =>
        errors.push({ name, message });

    for (const field of getVisibleFields(stepIndex, values)) {
        const value = readPath(values, field.name);

        if (field.required && isEmpty(value)) {
            add(
                field.name,
                `${field.label} is required.`
            );
            continue;
        }

        if (
            !isEmpty(value) &&
            (field.type === "number" || field.type === "stepper")
        ) {
            const number = Number(value);

            const belowMin =
                field.min != null && number < field.min;

            const aboveMax =
                field.max != null && number > field.max;

            if (!Number.isFinite(number)) {
                add(
                    field.name,
                    `${field.label} must be a number.`
                );
            } else if (belowMin || aboveMax) {
                add(
                    field.name,
                    rangeMessage(
                        field.label,
                        field.min,
                        field.max
                    )
                );
            }
        }
    }

    if (stepIndex === 0) {
        const age = getAge(values.basic?.dateOfBirth);

        if (age === null) {
            add(
                "basic.dateOfBirth",
                "Please enter a valid date of birth."
            );
        } else if (age < 18) {
            add(
                "basic.dateOfBirth",
                "You must be at least 18 years old."
            );
        } else if (age > 100) {
            add(
                "basic.dateOfBirth",
                "Please check your date of birth."
            );
        }
    }

    if (stepIndex === 3) {
        const family = values.family || {};

        if (
            family.brothersMarried != null &&
            family.brothers != null &&
            family.brothersMarried > family.brothers
        ) {
            add(
                "family.brothersMarried",
                "Married brothers cannot exceed the total number of brothers."
            );
        }

        if (
            family.sistersMarried != null &&
            family.sisters != null &&
            family.sistersMarried > family.sisters
        ) {
            add(
                "family.sistersMarried",
                "Married sisters cannot exceed the total number of sisters."
            );
        }
    }

    if (stepIndex === 5) {
        const prefs = values.partnerPreferences || {};

        if (
            prefs.ageMin != null &&
            prefs.ageMax != null &&
            prefs.ageMin > prefs.ageMax
        ) {
            add(
                "partnerPreferences.ageMax",
                "Maximum preferred age must be greater than or equal to minimum age."
            );
        }

        if (
            prefs.heightMinCm != null &&
            prefs.heightMaxCm != null &&
            prefs.heightMinCm > prefs.heightMaxCm
        ) {
            add(
                "partnerPreferences.heightMaxCm",
                "Maximum preferred height must be greater than or equal to minimum height."
            );
        }
    }

    return errors;
}

const toInvalidMap = (errors) =>
    Object.fromEntries(
        errors.map(({ name, message }) => [name, message])
    );

function CheckIcon() {
    return (
        <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
        >
            <path
                d="M5 12.5l4.5 4.5L19 7.5"
                stroke="currentColor"
                strokeWidth="2.6"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

export default function ProfileSetup() {
    const navigate = useNavigate();

    const {
        profile,
        profileStatus,
        saveProfile,
        submitProfile,
    } = useProfile();

    const [values, setValues] = useState(emptyProfile);
    const [step, setStep] = useState(0);
    const [saving, setSaving] = useState(false);
    const [invalid, setInvalid] = useState({});

    useEffect(() => {
        if (profile) {
            setValues(
                mergeProfileData(emptyProfile, profile)
            );

            setStep(
                Math.min(
                    PROFILE_STEPS.length - 1,
                    Math.max(
                        0,
                        Number(profile.currentStep) || 0
                    )
                )
            );
        }
    }, [profile]);

    // Bring the first problem field into view and focus it.
    useEffect(() => {
        const [first] = Object.keys(invalid);

        if (!first) return;

        const element = document.querySelector(
            `[data-field="${first}"]`
        );

        element?.scrollIntoView({
            block: "center",
            behavior: "smooth",
        });

        element
            ?.querySelector("input, select, textarea, button")
            ?.focus({ preventScroll: true });
    }, [invalid]);

    const progress = useMemo(
        () =>
            Math.round(
                ((step + 1) / PROFILE_STEPS.length) * 100
            ),
        [step]
    );

    if (
        profileStatus === "pending_review" ||
        profileStatus === "rejected"
    ) {
        return (
            <Navigate
                to={
                    profileStatus === "pending_review"
                        ? "/profile-pending"
                        : "/profile-rejected"
                }
                replace
            />
        );
    }

    function handleFieldChange(path, value) {
        setValues((current) =>
            writePath(current, path, value)
        );

        setInvalid((current) => {
            if (!(path in current)) return current;

            const next = { ...current };
            delete next[path];

            return next;
        });
    }

    async function saveCurrentStep(nextStep = step) {
        setSaving(true);

        try {
            // Photos are saved through the dedicated upload endpoints.
            const profileData = { ...values };
            delete profileData.photos;

            await saveProfile({
                ...profileData,
                currentStep: nextStep,
            });

            return true;
        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                "Unable to save your profile."
            );

            return false;
        } finally {
            setSaving(false);
        }
    }

    async function handleNext() {
        const errors = validateStep(step, values);

        if (errors.length) {
            setInvalid(toInvalidMap(errors));
            toast.error(errors[0].message);
            return;
        }

        const nextStep = Math.min(
            step + 1,
            PROFILE_STEPS.length - 1
        );

        if (await saveCurrentStep(nextStep)) {
            setInvalid({});
            setStep(nextStep);
        }
    }

    async function handleBack() {
        if (step === 0) return;

        const previousStep = Math.max(step - 1, 0);

        if (await saveCurrentStep(previousStep)) {
            setInvalid({});
            setStep(previousStep);
        }
    }

    async function handleSubmit() {
        const failing = PROFILE_STEPS
            .map((_, index) => ({
                index,
                errors: validateStep(index, values),
            }))
            .find((result) => result.errors.length > 0);

        if (failing) {
            toast.error(failing.errors[0].message);

            setStep(failing.index);
            setInvalid(toInvalidMap(failing.errors));

            return;
        }

        setSaving(true);

        try {
            // Photos are already stored through the photo endpoints.
            const profileData = { ...values };
            delete profileData.photos;

            await saveProfile({
                ...profileData,
                currentStep: PROFILE_STEPS.length - 1,
            });

            await submitProfile();

            toast.success(
                "Your profile has been submitted for review."
            );

            navigate("/profile-pending", {
                replace: true,
            });
        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                "Unable to submit your profile."
            );
        } finally {
            setSaving(false);
        }
    }

    const isLastStep =
        step === PROFILE_STEPS.length - 1;

    return (
        <AppLayout>
            <div className="profile-setup-page">
                <div className="profile-setup-top">
                    <span className="profile-setup-eyebrow">
                        Your profile
                    </span>

                    <h1>Create your profile</h1>

                    <p>
                        Complete these details to help us find
                        meaningful matches.
                    </p>
                </div>

                <motion.div
                    className="profile-setup-shell"
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                        duration: 0.5,
                        ease: [0.16, 1, 0.3, 1],
                    }}
                >
                    <aside
                        className="profile-rail"
                        aria-label="Profile steps"
                    >
                        <ol className="profile-rail__list">
                            {PROFILE_STEPS.map((item, index) => {
                                const state =
                                    index < step
                                        ? "is-done"
                                        : index === step
                                            ? "is-current"
                                            : "";

                                return (
                                    <li
                                        key={item.title}
                                        className={`profile-rail__item ${state}`.trim()}
                                        aria-current={
                                            index === step
                                                ? "step"
                                                : undefined
                                        }
                                    >
                                        <span className="profile-rail__dot">
                                            {index < step
                                                ? <CheckIcon />
                                                : index + 1}
                                        </span>

                                        <span className="profile-rail__label">
                                            {item.title}
                                        </span>
                                    </li>
                                );
                            })}
                        </ol>
                    </aside>

                    <section className="profile-setup-card">
                        <div
                            className="profile-progress"
                            role="progressbar"
                            aria-label="Profile completion"
                            aria-valuemin={0}
                            aria-valuemax={100}
                            aria-valuenow={progress}
                        >
                            <div className="profile-progress-label">
                                <span>
                                    Step {step + 1} of {PROFILE_STEPS.length}
                                </span>

                                <span>{progress}%</span>
                            </div>

                            <div className="profile-progress-track">
                                <div
                                    className="profile-progress-fill"
                                    style={{
                                        width: `${progress}%`,
                                    }}
                                />
                            </div>
                        </div>

                        <ProfileStepFields
                            step={step}
                            values={values}
                            invalid={invalid}
                            onChange={handleFieldChange}
                        />

                        {isLastStep && (
                            <ProfilePhotoUpload
                                photos={values.photos}
                                onChange={(photos) =>
                                    handleFieldChange(
                                        "photos",
                                        photos
                                    )
                                }
                                disabled={
                                    saving ||
                                    [
                                        "pending_review",
                                        "rejected",
                                    ].includes(profileStatus)
                                }
                            />
                        )}

                        <div className="profile-setup-actions">
                            <Button
                                variant="secondary"
                                onClick={handleBack}
                                disabled={step === 0 || saving}
                            >
                                Back
                            </Button>

                            {isLastStep ? (
                                <Button
                                    onClick={handleSubmit}
                                    isLoading={saving}
                                    loadingText="Submitting…"
                                >
                                    Submit for approval
                                </Button>
                            ) : (
                                <Button
                                    onClick={handleNext}
                                    isLoading={saving}
                                    loadingText="Saving…"
                                >
                                    Save and continue
                                </Button>
                            )}
                        </div>

                        <p className="profile-setup-footnote">
                            Your progress is saved as you continue.
                            Your profile will not be visible to other
                            members until it is approved.
                        </p>
                    </section>
                </motion.div>
            </div>
        </AppLayout>
    );
}