
import { Navigate, Outlet, Route, Routes } from "react-router-dom";

// Authentication pages
import Login from "./pages/auth/Login.jsx";
import Register from "./pages/auth/Register.jsx";
import ForgotPassword from "./pages/auth/ForgotPassword.jsx";
import ResetPassword from "./pages/auth/ResetPassword.jsx";
import VerifyEmail from "./pages/auth/VerifyEmail.jsx";

// Public information pages
import Terms from "./pages/common/Terms.jsx";
import Privacy from "./pages/common/Privacy.jsx";
import Support from "./pages/common/Support.jsx";

// Application pages
import AppHome from "./pages/app/AppHome.jsx";

// Onboarding pages
import ProfileSetup from "./pages/onboarding/ProfileSetup.jsx";
import ProfileStatus from "./pages/onboarding/ProfileStatus.jsx";

// Route guards
import ProtectedRoute from "./routes/ProtectedRoute.jsx";
import GuestRoute from "./routes/GuestRoute.jsx";
import ProfileGate from "./routes/ProfileGate.jsx";

export function App() {
  return (
    <Routes>

      {/* Default route */}
      <Route path="/" element={<Navigate to="/app" replace />} />

      {/* Public information pages - No authentication or ProfileGate */}
      <Route path="/terms-and-conditions" element={<Terms />} />
      <Route path="/privacy-policy" element={<Privacy />} />
      <Route path="/support" element={<Support />} />

      {/* Guest / Authentication routes */}
      <Route element={<GuestRoute><Outlet /></GuestRoute>}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Route>

      {/* Authenticated application */}
      <Route element={<ProtectedRoute><Outlet /></ProtectedRoute>}>

        {/* Profile status verification */}
        <Route element={<ProfileGate><Outlet /></ProfileGate>}>

          {/* Onboarding */}
          <Route path="/profile-setup" element={<ProfileSetup />} />
          <Route path="/profile-status" element={<ProfileStatus />} />

          {/* Approved member pages */}
          <Route path="/app" element={<AppHome />} />

          {/* Future application pages */}
          {/* <Route path="/discover" element={<Discover />} /> */}
          {/* <Route path="/matches" element={<Matches />} /> */}
          {/* <Route path="/messages" element={<Messages />} /> */}
          {/* <Route path="/notifications" element={<Notifications />} /> */}
          {/* <Route path="/settings" element={<Settings />} /> */}

        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/app" replace />} />

    </Routes>
  );
}

export default App;
