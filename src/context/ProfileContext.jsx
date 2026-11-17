
import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import { AuthContext } from "./AuthContext.jsx";
import profileService from "../services/profileService.js";

export const ProfileContext = createContext(null);

export function ProfileProvider({ children }) {
    const auth = useContext(AuthContext);

    // =========================================================
    // Active Profile State
    // =========================================================

    const [profile, setProfile] = useState(null);
    const [profileStatus, setProfileStatus] = useState("unknown");
    const [completionPercentage, setCompletionPercentage] = useState(0);

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    // =========================================================
    // Profile Revision State
    // =========================================================

    const [revision, setRevision] = useState(null);
    const [revisionStatus, setRevisionStatus] = useState("unknown");
    const [revisionCompletionPercentage, setRevisionCompletionPercentage] =
        useState(0);

    const [isRevisionLoading, setIsRevisionLoading] = useState(false);
    const [revisionError, setRevisionError] = useState("");

    // Prevent older requests from overwriting newer results.
    const requestId = useRef(0);
    const revisionRequestId = useRef(0);

    // =========================================================
    // Active Profile Operations
    // =========================================================

    const refreshProfile = useCallback(async () => {
        const currentRequestId = ++requestId.current;

        setIsLoading(true);
        setError("");

        try {
            const result = await profileService.getMyProfile();

            if (currentRequestId !== requestId.current) {
                return result;
            }

            setProfile(result?.profile || null);
            setProfileStatus(result?.status || "not_created");

            setCompletionPercentage(
                result?.completionPercentage || 0
            );

            return result;
        } catch (err) {
            if (currentRequestId === requestId.current) {
                setError(
                    err.response?.data?.message ||
                    "Unable to load your profile."
                );
            }

            throw err;
        } finally {
            if (currentRequestId === requestId.current) {
                setIsLoading(false);
            }
        }
    }, []);

    const saveProfile = useCallback(async (data) => {
        const result = await profileService.saveMyProfile(data);
        const payload = result.data;

        setProfile(payload.profile || null);
        setProfileStatus(payload.status || "not_created");

        setCompletionPercentage(
            payload.completionPercentage || 0
        );

        setError("");

        return result;
    }, []);

    const submitProfile = useCallback(async () => {
        const result = await profileService.submitMyProfile();
        const payload = result.data;

        setProfile(payload.profile || null);
        setProfileStatus(payload.status || "not_created");

        setCompletionPercentage(
            payload.completionPercentage || 0
        );

        setError("");

        return result;
    }, []);

    // =========================================================
    // Profile Revision Operations
    // =========================================================

    const refreshRevision = useCallback(async () => {
        const currentRequestId = ++revisionRequestId.current;

        setIsRevisionLoading(true);
        setRevisionError("");

        try {
            const result = await profileService.getMyRevision();

            if (currentRequestId !== revisionRequestId.current) {
                return result;
            }

            setRevision(result?.revision || null);
            setRevisionStatus(result?.status || "not_created");

            setRevisionCompletionPercentage(
                result?.completionPercentage || 0
            );

            return result;
        } catch (err) {
            if (currentRequestId === revisionRequestId.current) {
                setRevisionError(
                    err.response?.data?.message ||
                    "Unable to load your profile changes."
                );
            }

            throw err;
        } finally {
            if (currentRequestId === revisionRequestId.current) {
                setIsRevisionLoading(false);
            }
        }
    }, []);

    const saveRevision = useCallback(async (data) => {
        const result = await profileService.saveMyRevision(data);
        const payload = result.data;

        setRevision(payload.revision || null);
        setRevisionStatus(payload.status || "draft");

        setRevisionCompletionPercentage(
            payload.completionPercentage || 0
        );

        setRevisionError("");

        return result;
    }, []);

    const submitRevision = useCallback(async () => {
        const result = await profileService.submitMyRevision();
        const payload = result.data;

        setRevision(payload.revision || null);
        setRevisionStatus(payload.status || "pending_review");

        setRevisionCompletionPercentage(
            payload.completionPercentage || 0
        );

        setRevisionError("");

        return result;
    }, []);

    const clearRevision = useCallback(() => {
        revisionRequestId.current += 1;

        setRevision(null);
        setRevisionStatus("unknown");
        setRevisionCompletionPercentage(0);
        setIsRevisionLoading(false);
        setRevisionError("");
    }, []);

    // =========================================================
    // Active Profile Photo Operations
    // =========================================================

    const updateProfilePhotos = useCallback((photos) => {
        setProfile((current) => {
            if (!current) return current;

            return {
                ...current,
                photos,
            };
        });
    }, []);

    const uploadProfilePhoto = useCallback(async (file) => {
        const result = await profileService.uploadProfilePhoto(file);

        updateProfilePhotos(result.photos);

        return result;
    }, [updateProfilePhotos]);

    const uploadGalleryPhoto = useCallback(async (file) => {
        const result = await profileService.uploadGalleryPhoto(file);

        updateProfilePhotos(result.photos);

        return result;
    }, [updateProfilePhotos]);

    const deleteProfilePhoto = useCallback(async (imageId) => {
        const result = await profileService.deleteProfilePhoto(imageId);

        updateProfilePhotos(result.photos);

        return result;
    }, [updateProfilePhotos]);

    // =========================================================
    // Revision Photo Operations
    // =========================================================

    const updateRevisionFromPhotoResult = useCallback((result) => {
        // The backend may create the first revision during photo upload.
        // Prefer the complete revision returned by the backend.
        if (result?.revision) {
            setRevision(result.revision);

            setRevisionStatus(
                result.revision.status || "draft"
            );

            setRevisionCompletionPercentage(
                result.revision.completionPercentage || 0
            );

            setRevisionError("");

            return;
        }

        // Fallback: update only the photo data on an existing revision.
        if (result?.photos) {
            setRevision((current) => {
                if (!current) return current;

                return {
                    ...current,
                    profileData: {
                        ...(current.profileData || {}),
                        photos: result.photos,
                    },
                };
            });
        }
    }, []);

    const uploadRevisionProfilePhoto = useCallback(async (file) => {
        const result =
            await profileService.uploadRevisionProfilePhoto(file);

        updateRevisionFromPhotoResult(result);

        return result;
    }, [updateRevisionFromPhotoResult]);

    const uploadRevisionGalleryPhoto = useCallback(async (file) => {
        const result =
            await profileService.uploadRevisionGalleryPhoto(file);

        updateRevisionFromPhotoResult(result);

        return result;
    }, [updateRevisionFromPhotoResult]);

    const deleteRevisionPhoto = useCallback(async (imageId) => {
        const result =
            await profileService.deleteRevisionPhoto(imageId);

        updateRevisionFromPhotoResult(result);

        return result;
    }, [updateRevisionFromPhotoResult]);

    // =========================================================
    // Clear Profile Data
    // =========================================================

    const clearProfile = useCallback(() => {
        requestId.current += 1;

        setProfile(null);
        setProfileStatus("unknown");
        setCompletionPercentage(0);

        setIsLoading(false);
        setError("");

        clearRevision();
    }, [clearRevision]);

    // =========================================================
    // Authentication Synchronisation
    // =========================================================

    useEffect(() => {
        if (auth?.status === "loading") {
            return;
        }

        if (auth?.status === "unauthenticated") {
            clearProfile();
            return;
        }

        if (auth?.status === "authenticated") {
            refreshProfile().catch(() => {
                // Error is already stored in context.
            });

            refreshRevision().catch(() => {
                // Error is already stored in context.
            });
        }
    }, [
        auth?.status,
        auth?.user?._id,
        refreshProfile,
        refreshRevision,
        clearProfile,
    ]);

    // =========================================================
    // Context Value
    // =========================================================

    const value = useMemo(() => ({
        // Active profile
        profile,
        profileStatus,
        completionPercentage,
        isLoading,
        error,

        refreshProfile,
        saveProfile,
        submitProfile,
        clearProfile,

        // Revision
        revision,
        revisionStatus,
        revisionCompletionPercentage,
        isRevisionLoading,
        revisionError,

        refreshRevision,
        saveRevision,
        submitRevision,
        clearRevision,

        // Active profile photos
        updateProfilePhotos,
        uploadProfilePhoto,
        uploadGalleryPhoto,
        deleteProfilePhoto,

        // Revision photos
        uploadRevisionProfilePhoto,
        uploadRevisionGalleryPhoto,
        deleteRevisionPhoto,

    }), [
        profile,
        profileStatus,
        completionPercentage,
        isLoading,
        error,

        refreshProfile,
        saveProfile,
        submitProfile,
        clearProfile,

        revision,
        revisionStatus,
        revisionCompletionPercentage,
        isRevisionLoading,
        revisionError,

        refreshRevision,
        saveRevision,
        submitRevision,
        clearRevision,

        updateProfilePhotos,
        uploadProfilePhoto,
        uploadGalleryPhoto,
        deleteProfilePhoto,

        uploadRevisionProfilePhoto,
        uploadRevisionGalleryPhoto,
        deleteRevisionPhoto,
    ]);

    return (
        <ProfileContext.Provider value={value}>
            {children}
        </ProfileContext.Provider>
    );
}
