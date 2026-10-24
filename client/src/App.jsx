import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { PlayerProvider } from './context/PlayerContext';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import LibraryPage from './pages/LibraryPage';
import PlaylistPage from './pages/PlaylistPage';
import UploadPage from './pages/UploadPage';
import SettingsPage from './pages/SettingsPage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PWAInstallBanner from './components/PWAInstallBanner';

// Full-screen spinner — used while JWT is being verified
function SplashScreen() {
  return (
    <div className="flex items-center justify-center h-screen w-screen bg-sp-bg">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-2 border-sp-green border-t-transparent rounded-full animate-spin" />
        <p className="text-sp-muted text-sm">Loading…</p>
      </div>
    </div>
  );
}

// Redirects already-logged-in users away from /login and /register
function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <SplashScreen />;
  return user ? <Navigate to="/" replace /> : children;
}

// Guards private routes — redirects to /login when unauthenticated
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <SplashScreen />;
  return user
    ? children
    : <Navigate to="/login" state={{ from: location }} replace />;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public pages */}
      <Route path="/login"    element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

      {/* Protected app shell */}
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <PlayerProvider>
              <Layout>
                <Routes>
                  <Route index                element={<HomePage />} />
                  <Route path="search"        element={<SearchPage />} />
                  <Route path="library"       element={<LibraryPage />} />
                  <Route path="playlist/:id"  element={<PlaylistPage />} />
                  <Route path="upload"        element={<UploadPage />} />
                  <Route path="settings"      element={<SettingsPage />} />
                  <Route path="profile"       element={<ProfilePage />} />
                  {/* Catch-all → home (prevents blank screen on unknown paths) */}
                  <Route path="*"             element={<Navigate to="/" replace />} />
                </Routes>
              </Layout>
            </PlayerProvider>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <PWAInstallBanner />
      <AppRoutes />
    </AuthProvider>
  );
}
