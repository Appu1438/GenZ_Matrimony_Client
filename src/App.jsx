
import { Navigate, Outlet, Route, Routes } from "react-router-dom";

// Authentication pages
import Login from "./pages/user/auth/Login.jsx";
import Register from "./pages/user/auth/Register.jsx";
import ForgotPassword from "./pages/user/auth/ForgotPassword.jsx";
import ResetPassword from "./pages/user/auth/ResetPassword.jsx";
import VerifyEmail from "./pages/user/auth/VerifyEmail.jsx";

// Public information pages
import Terms from "./pages/common/Terms.jsx";
import Privacy from "./pages/common/Privacy.jsx";
import Support from "./pages/common/Support.jsx";

// Application pages
import AppHome from "./pages/user/home/AppHome.jsx";
import MyProfile from "./pages/user/profile/MyProfile.jsx";
import Settings from "./pages/user/settings/Settings.jsx";

// Onboarding pages
import ProfileSetup from "./pages/user/onboarding/ProfileSetup.jsx";
import ProfileStatus from "./pages/user/onboarding/ProfileStatus.jsx";

// Route guards
import ProtectedRoute from "./routes/user/ProtectedRoute.jsx";
import GuestRoute from "./routes/user/GuestRoute.jsx";
import ProfileGate from "./routes/user/ProfileGate.jsx";
import AdminGuestRoute from "./routes/admin/AdminGuestRoute.jsx";
import AdminLogin from "./pages/admin/auth/Login.jsx";
import AdminProtectedRoute from "./routes/admin/AdminProtectedRoute.jsx";
import AdminHome from "./pages/admin/home/Home.jsx";

export function App() {
  return (
    <Routes>

      {/* Default Route */}
      <Route path="/" element={<Navigate to="/app" replace />} />
      <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />

      {/* Public information pages - No authentication or ProfileGate */}
      <Route path="/terms-and-conditions" element={<Terms />} />
      <Route path="/privacy-policy" element={<Privacy />} />
      <Route path="/support" element={<Support />} />

      {/* Guest / Authentication Routes */}
      <Route element={<GuestRoute><Outlet /></GuestRoute>}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Route>

      {/* Authenticated Application */}
      <Route element={<ProtectedRoute><Outlet /></ProtectedRoute>}>

        {/* Profile status verification */}
        <Route element={<ProfileGate><Outlet /></ProfileGate>}>

          {/* Onboarding */}
          <Route path="/profile-setup" element={<ProfileSetup />} />
          <Route path="/profile-status" element={<ProfileStatus />} />

          {/* Approved member pages */}
          <Route path="/app" element={<AppHome />} />
          <Route path="/my-profile" element={<MyProfile />} />
          <Route path="/settings" element={<Settings />} />
          {/* Future application pages */}
          {/* <Route path="/discover" element={<Discover />} /> */}
          {/* <Route path="/matches" element={<Matches />} /> */}
          {/* <Route path="/messages" element={<Messages />} /> */}
          {/* <Route path="/notifications" element={<Notifications />} /> */}
          {/* <Route path="/settings" element={<Settings />} /> */}

        </Route>
      </Route>

      {/* Guest / Authentication Admin Routes */}
      <Route element={<AdminGuestRoute><Outlet /></AdminGuestRoute>}>
        <Route path="/admin/login" element={<AdminLogin />} />
      </Route>

      {/* Authenticated Admin Application */}
      <Route element={<AdminProtectedRoute><Outlet /></AdminProtectedRoute>}>
        <Route path="/admin/dashboard" element={<AdminHome />} />

      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/app" replace />} />

    </Routes>
  );
}

export default App;
