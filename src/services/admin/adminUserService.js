import axiosInstance from "../../api/axiosIntance";


const BASE_URL = "/admin/users";

const adminUserService = {
    // Get users with pagination and filters
    getUsers: async (params = {}) => {
        const response = await axiosInstance.get(BASE_URL, {
            params,
        });

        return response.data;
    },

    // Get user statistics
    getStats: async () => {
        const response = await axiosInstance.get(
            `${BASE_URL}/stats`
        );

        return response.data;
    },

    // Get individual user
    getUser: async (userId) => {
        const response = await axiosInstance.get(
            `${BASE_URL}/${userId}`
        );

        return response.data;
    },

    // Update user account status
    updateStatus: async (userId, accountStatus) => {
        const response = await axiosInstance.patch(
            `${BASE_URL}/${userId}/status`,
            { accountStatus }
        );

        return response.data;
    },
};

export default adminUserService;
