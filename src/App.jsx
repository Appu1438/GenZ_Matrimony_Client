
import { Navigate, Route, Routes } from "react-router-dom";

// Authentication pages
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";
import VerifyEmail from "./pages/VerifyEmail.jsx";

// Public information pages
import Terms from "./pages/Terms.jsx";
import Privacy from "./pages/Privacy.jsx";
import Support from "./pages/Support.jsx";

// Application
import AppHome from "./pages/AppHome.jsx";

// Route guards
import ProtectedRoute from "./routes/ProtectedRoute.jsx";
import GuestRoute from "./routes/GuestRoute.jsx";

export function App() {
  return (
    <Routes>

      {/* Default route */}
      <Route
        path="/"
        element={<Navigate to="/app" replace />}
      />

      {/* Guest-only authentication routes */}
      <Route
        path="/login"
        element={
          <GuestRoute>
            <Login />
          </GuestRoute>
        }
      />

      <Route
        path="/register"
        element={
          <GuestRoute>
            <Register />
          </GuestRoute>
        }
      />

      <Route
        path="/forgot-password"
        element={
          <GuestRoute>
            <ForgotPassword />
          </GuestRoute>
        }
      />

      <Route
        path="/reset-password"
        element={
          <GuestRoute>
            <ResetPassword />
          </GuestRoute>
        }
      />

      {/* Public routes - No authentication required */}

      <Route
        path="/verify-email"
        element={<VerifyEmail />}
      />

      <Route
        path="/terms-and-conditions"
        element={<Terms />}
      />

      <Route
        path="/privacy-policy"
        element={<Privacy />}
      />

      <Route
        path="/support"
        element={<Support />}
      />

      {/* Protected application routes */}

      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <AppHome />
          </ProtectedRoute>
        }
      />

      {/* Fallback */}

      <Route
        path="*"
        element={<Navigate to="/app" replace />}
      />

    </Routes>
  );
}

export default App;
