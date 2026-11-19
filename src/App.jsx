
import { Navigate, Outlet, Route, Routes } from "react-router-dom";

// User authentication
import Login from "./pages/user/auth/Login.jsx";
import Register from "./pages/user/auth/Register.jsx";
import ForgotPassword from "./pages/user/auth/ForgotPassword.jsx";
import ResetPassword from "./pages/user/auth/ResetPassword.jsx";
import VerifyEmail from "./pages/user/auth/VerifyEmail.jsx";

// Public pages
import Terms from "./pages/common/Terms.jsx";
import Privacy from "./pages/common/Privacy.jsx";
import Support from "./pages/common/Support.jsx";

// User application
import AppHome from "./pages/user/home/AppHome.jsx";
import MyProfile from "./pages/user/profile/MyProfile.jsx";
import Settings from "./pages/user/settings/Settings.jsx";

// User onboarding
import ProfileSetup from "./pages/user/onboarding/ProfileSetup.jsx";
import ProfileStatus from "./pages/user/onboarding/ProfileStatus.jsx";

// User route guards
import GuestRoute from "./routes/user/GuestRoute.jsx";
import ProtectedRoute from "./routes/user/ProtectedRoute.jsx";
import ProfileGate from "./routes/user/ProfileGate.jsx";

// Admin authentication
import AdminLogin from "./pages/admin/auth/Login.jsx";

// Admin application
import AdminHome from "./pages/admin/home/Home.jsx";
import Users from "./pages/admin/users/Users.jsx";
import UserView from "./pages/admin/users/UserView.jsx";
import Profiles from "./pages/admin/profiles/Profiles.jsx";

// Admin route guards
import AdminGuestRoute from "./routes/admin/AdminGuestRoute.jsx";
import AdminProtectedRoute from "./routes/admin/AdminProtectedRoute.jsx";


export function App() {
  return (
    <Routes>
      {/* Default */}
      <Route path="/" element={<Navigate to="/app" replace />} />
      <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />

      {/* Public pages */}
      <Route path="/terms-and-conditions" element={<Terms />} />
      <Route path="/privacy-policy" element={<Privacy />} />
      <Route path="/support" element={<Support />} />

      {/* User guest routes */}
      <Route element={<GuestRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Route>

      {/* User protected routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<ProfileGate />}>
          <Route path="/profile-setup" element={<ProfileSetup />} />
          <Route path="/profile-status" element={<ProfileStatus />} />

          <Route path="/app" element={<AppHome />} />
          <Route path="/my-profile" element={<MyProfile />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Route>

      {/* Admin guest routes */}
      <Route element={<AdminGuestRoute />}>
        <Route path="/admin/login" element={<AdminLogin />} />
      </Route>

      {/* Admin protected routes */}
      <Route element={<AdminProtectedRoute />}>
        <Route path="/admin/dashboard" element={<AdminHome />} />
        <Route path="/admin/users" element={<Users />} />
        <Route path="/admin/users/:id" element={<UserView />} />
        <Route path="/admin/profiles" element={<Profiles />} />
      </Route>

      {/* Fallback */}
      <Route
        path="*"
        element={
          window.location.pathname.startsWith("/admin")
            ? <Navigate to="/admin/dashboard" replace />
            : <Navigate to="/app" replace />
        }
      />
    </Routes>
  );
}

export default App;
