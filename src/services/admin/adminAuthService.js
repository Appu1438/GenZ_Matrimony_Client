
import axiosInstance from "../../api/axiosIntance";

// Extract the API response payload consistently.
function getResponseData(response) {
  return response.data?.data ?? response.data;
}

// ADMIN LOGIN
const login = async (credentials) => {
  const response = await axiosInstance.post("/admin/auth/login", {
    identifier: credentials.identifier,
    password: credentials.password,
    remember: Boolean(credentials.remember),
  });

  // Expected response: { success, message, data: { admin } }
  return getResponseData(response);
};

// REFRESH ADMIN SESSION
const refreshSession = async () => {
  const response = await axiosInstance.post("/admin/auth/refresh");

  // Expected response: { success, message, data: { admin } }
  return getResponseData(response);
};

// GET CURRENT ADMIN
const getCurrentAdmin = async () => {
  try {
    const response = await axiosInstance.get("/admin/auth/me");

    const data = getResponseData(response);

    return data?.admin || data?.user || null;
  } catch (error) {
    if (error.response?.status === 401) {
      return null;
    }

    throw error;
  }
};

// ADMIN LOGOUT
const logout = async () => {
  const response = await axiosInstance.post("/admin/auth/logout");

  return response.data;
};

const adminAuthService = {
  login,
  refreshSession,
  getCurrentAdmin,
  logout,
};

export default adminAuthService;
