import axiosInstance from "../api/axiosIntance";

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

const profileService = {
    getMyProfile,
    saveMyProfile,
    submitMyProfile,
    uploadProfilePhoto,
    uploadGalleryPhoto,
    deleteProfilePhoto,
};

export default profileService;