import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { AuthProvider } from './context/user/AuthContext.jsx';
import { ProfileProvider } from './context/user/ProfileContext.jsx';
import './index.css';
import { Toaster } from 'react-hot-toast';
import { AdminAuthProvider } from './context/admin/AdminAuthContext.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Toaster
        position="top-right"
        reverseOrder={false}
        toastOptions={{
          duration: 3500,
          style: {
            background: "#111827",
            color: "#ffffff",
            borderRadius: "10px",
            fontSize: "14px",
          },
          success: {
            iconTheme: {
              primary: "#22c55e",
              secondary: "#ffffff",
            },
          },
        }}
      />
      <AuthProvider>
        <ProfileProvider>
          <AdminAuthProvider>
            <App />
          </AdminAuthProvider>
        </ProfileProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
