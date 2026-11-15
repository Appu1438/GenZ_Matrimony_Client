
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

    const [profile, setProfile] = useState(null);
    const [profileStatus, setProfileStatus] = useState("unknown");
    const [completionPercentage, setCompletionPercentage] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    // Prevent older requests from overwriting newer results.
    const requestId = useRef(0);

    const refreshProfile = useCallback(async () => {
        const currentRequestId = ++requestId.current;

        setIsLoading(true);
        setError("");

        try {
            const result = await profileService.getMyProfile();

            // Ignore outdated requests.
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
                const message =
                    err.response?.data?.message ||
                    "Unable to load your profile.";

                setError(message);
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

    // Synchronise photo changes with the global profile state.
    const updateProfilePhotos = useCallback((photos) => {
        setProfile((current) => {
            if (!current) return current;

            return {
                ...current,
                photos,
            };
        });
    }, []);

    // Upload profile photo and update context immediately.
    const uploadProfilePhoto = useCallback(async (file) => {
        const result = await profileService.uploadProfilePhoto(file);

        updateProfilePhotos(result.photos);

        return result;
    }, [updateProfilePhotos]);

    // Upload gallery photo and update context immediately.
    const uploadGalleryPhoto = useCallback(async (file) => {
        const result = await profileService.uploadGalleryPhoto(file);

        updateProfilePhotos(result.photos);

        return result;
    }, [updateProfilePhotos]);

    // Delete photo and update context immediately.
    const deleteProfilePhoto = useCallback(async (imageId) => {
        const result = await profileService.deleteProfilePhoto(imageId);

        updateProfilePhotos(result.photos);

        return result;
    }, [updateProfilePhotos]);

    const clearProfile = useCallback(() => {
        // Invalidate any pending profile request.
        requestId.current += 1;

        setProfile(null);
        setProfileStatus("unknown");
        setCompletionPercentage(0);
        setIsLoading(false);
        setError("");
    }, []);

    // Automatically load the profile after authentication
    // has been restored, including after a browser refresh.
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
        }
    }, [
        auth?.status,
        auth?.user?._id,
        refreshProfile,
        clearProfile,
    ]);

    const value = useMemo(() => ({
        profile,
        profileStatus,
        completionPercentage,
        isLoading,
        error,

        refreshProfile,
        saveProfile,
        submitProfile,
        clearProfile,

        // Photo operations
        updateProfilePhotos,
        uploadProfilePhoto,
        uploadGalleryPhoto,
        deleteProfilePhoto,
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
        updateProfilePhotos,
        uploadProfilePhoto,
        uploadGalleryPhoto,
        deleteProfilePhoto,
    ]);

    return (
        <ProfileContext.Provider value={value}>
            {children}
        </ProfileContext.Provider>
    );
}
