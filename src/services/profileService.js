
import axiosInstance from "../api/axiosIntance";

// =========================================================================
// Active Profile APIs
// =========================================================================

const getMyProfile = async () => {
    const response = await axiosInstance.get("/profile/me");
    return response.data.data;
};

const saveMyProfile = async (profileData) => {
    const response = await axiosInstance.put(
        "/profile/me",
        profileData
    );

    return response.data;
};

const submitMyProfile = async () => {
    const response = await axiosInstance.post(
        "/profile/me/submit"
    );

    return response.data;
};

// =========================================================================
// Shared Photo Upload Helper
// =========================================================================

async function uploadPhoto(endpoint, file) {
    const formData = new FormData();
    formData.append("photo", file);

    const response = await axiosInstance.post(
        endpoint,
        formData,
        {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        }
    );

    return response.data.data;
}

// =========================================================================
// Active Profile Photo APIs
// =========================================================================

const uploadProfilePhoto = (file) =>
    uploadPhoto("/profile/photos/profile", file);

const uploadGalleryPhoto = (file) =>
    uploadPhoto("/profile/photos/gallery", file);

const deleteProfilePhoto = async (imageId) => {
    const response = await axiosInstance.delete(
        `/profile/photos/${encodeURIComponent(imageId)}`
    );

    return response.data.data;
};

// =========================================================================
// Approved Profile Revision APIs
// =========================================================================

const getMyRevision = async () => {
    const response = await axiosInstance.get(
        "/profile/me/revision"
    );

    return response.data.data;
};

const saveMyRevision = async (payload) => {
    const response = await axiosInstance.put(
        "/profile/me/revision",
        payload
    );

    return response.data;
};

const submitMyRevision = async () => {
    const response = await axiosInstance.post(
        "/profile/me/revision/submit"
    );

    return response.data;
};

// =========================================================================
// Revision Photo APIs
// =========================================================================

const uploadRevisionProfilePhoto = (file) =>
    uploadPhoto("/profile/photos/revision/profile", file);

const uploadRevisionGalleryPhoto = (file) =>
    uploadPhoto("/profile/photos/revision/gallery", file);

const deleteRevisionPhoto = async (imageId) => {
    const response = await axiosInstance.delete(
        `/profile/photos/revision/${encodeURIComponent(imageId)}`
    );

    return response.data.data;
};

// =========================================================================
// Export
// =========================================================================

const profileService = {
    // Active profile
    getMyProfile,
    saveMyProfile,
    submitMyProfile,

    // Active profile photos
    uploadProfilePhoto,
    uploadGalleryPhoto,
    deleteProfilePhoto,

    // Revision
    getMyRevision,
    saveMyRevision,
    submitMyRevision,

    // Revision photos
    uploadRevisionProfilePhoto,
    uploadRevisionGalleryPhoto,
    deleteRevisionPhoto,
};

export default profileService;
