
import axiosInstance from "../../api/axiosIntance";

// LOGIN
export const login = async (credentials) => {
  const response = await axiosInstance.post("/auth/login", {
    identifier: credentials.identifier,
    password: credentials.password,
    remember: credentials.remember,
  });

  return response.data.data;
};

// REGISTER
export const register = async (data) => {
  const response = await axiosInstance.post("/auth/register", {
    fullName: data.fullName,
    email: data.email,
    mobile: data.mobile,
    password: data.password,
  });

  return response.data;
};

// VERIFY EMAIL
export const verifyEmail = async (token) => {
  const response = await axiosInstance.post("/auth/verify-email", {
    token,
  });

  return response.data;
};

// RESEND VERIFICATION EMAIL
export const resendVerificationEmail = async (email) => {
  const response = await axiosInstance.post(
    "/auth/resend-verification",
    { email }
  );

  return response.data;
};

// REFRESH SESSION
export const refreshSession = async () => {
  const response = await axiosInstance.post("/auth/refresh");

  return response.data.data;
};

// GET CURRENT USER
export const getCurrentUser = async () => {
  try {
    const response = await axiosInstance.get("/auth/me");

    return response.data.data.user;
  } catch (error) {
    if (error.response?.status === 401) {
      return null;
    }

    throw error;
  }
};

// LOGOUT
export const logout = async () => {
  const response = await axiosInstance.post("/auth/logout");

  return response.data;
};

// FORGOT PASSWORD
export const forgotPassword = async (identifier) => {
  const response = await axiosInstance.post(
    "/auth/forgot-password",
    { identifier }
  );

  return response.data;
};

// RESET PASSWORD
export const resetPassword = async (data) => {
  const response = await axiosInstance.post(
    "/auth/reset-password",
    data
  );

  return response.data;
};

const authService = {
  login,
  register,
  verifyEmail,
  resendVerificationEmail,
  refreshSession,
  getCurrentUser,
  logout,
  forgotPassword,
  resetPassword,
};

export default authService;
