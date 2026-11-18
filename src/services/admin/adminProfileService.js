import axiosInstance from "../../api/axiosIntance";


const BASE_URL = "/admin/profiles";

const adminProfileService = {
    getProfiles: (params = {}) =>
        axiosInstance.get(BASE_URL, { params }),

    getStats: () =>
        axiosInstance.get(`${BASE_URL}/stats`),

    getProfile: (id) =>
        axiosInstance.get(`${BASE_URL}/${id}`),

    reviewProfile: (id, payload) =>
        axiosInstance.patch(`${BASE_URL}/${id}/review`, payload),
};

export default adminProfileService;
