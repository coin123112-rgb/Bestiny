import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PlayerProvider } from './context/PlayerContext';
import { _setGuestModalOpener } from './context/PlayerContext';
import { ThemeProvider } from './context/ThemeContext';
import { I18nProvider } from './context/I18nContext';
import Layout from './components/Layout';
import GuestAuthModal from './components/GuestAuthModal';
import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import LibraryPage from './pages/LibraryPage';
import PlaylistPage from './pages/PlaylistPage';
import UploadPage, { UploadPageSafe } from './pages/UploadPage';
import SettingsPage from './pages/SettingsPage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// ── GuestModal context ────────────────────────────────────────────────────
// Lets any component open the "Sign in to continue" modal.
// onContinue: optional callback to run after "Later" is clicked.
export const GuestModalContext = createContext(null);

export function useGuestModal() {
  const ctx = useContext(GuestModalContext);
  if (!ctx) throw new Error('useGuestModal must be used within App');
  return ctx;
}

// ── Splash screen ─────────────────────────────────────────────────────────
function SplashScreen() {
  return (
    <div className="flex items-center justify-center h-screen w-screen bg-sp-bg">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-2 border-sp-green border-t-transparent
                        rounded-full animate-spin" />
        <p className="text-sp-muted text-sm">Loading…</p>
      </div>
    </div>
  );
}

// ── Route guards ──────────────────────────────────────────────────────────

/** Logged-in users are sent home immediately */
function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <SplashScreen />;
  return user ? <Navigate to="/" replace /> : children;
}

/**
 * Every route renders for everyone — but when unauthenticated the page is still
 * shown, and the GuestAuthModal will fire when a protected action is attempted.
 * Upload page is still truly protected (redirects to login).
 */
function GuestOrAuthRoute({ children }) {
  const { loading } = useAuth();
  if (loading) return <SplashScreen />;
  return children;
}

/** Hard-protected pages (require login) */
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <SplashScreen />;
  return user
    ? children
    : <Navigate to="/login" state={{ from: location }} replace />;
}

// Wires the guest modal opener into PlayerContext (singleton ref)
function GuestModalWirer({ opener }) {
  useEffect(() => { _setGuestModalOpener(opener); }, [opener]);
  return null;
}

// ── Main routes ───────────────────────────────────────────────────────────
function AppRoutes() {
  return (
    <Routes>
      <Route path="/login"    element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

      <Route
        path="/*"
        element={
          <GuestOrAuthRoute>
            <PlayerProvider>
              <Layout>
                <Routes>
                  <Route index               element={<HomePage />} />
                  <Route path="search"       element={<SearchPage />} />
                  <Route path="library"      element={<LibraryPage />} />
                  <Route path="playlist/:id" element={<PlaylistPage />} />
                  <Route path="settings"     element={<SettingsPage />} />
                  <Route path="profile"      element={<ProfilePage />} />
                  {/* Upload is truly protected */}
                  <Route path="upload"       element={<ProtectedRoute><UploadPageSafe /></ProtectedRoute>} />
                  <Route path="*"            element={<Navigate to="/" replace />} />
                </Routes>
              </Layout>
            </PlayerProvider>
          </GuestOrAuthRoute>
        }
      />
    </Routes>
  );
}

// ── Root App ──────────────────────────────────────────────────────────────
export default function App() {
  const [modalState, setModalState] = useState({
    open: false,
    onContinue: null,
  });

  const openGuestModal = useCallback((onContinue) => {
    setModalState({ open: true, onContinue: onContinue ?? null });
  }, []);

  const closeGuestModal = useCallback(() => {
    setModalState({ open: false, onContinue: null });
  }, []);

  return (
    <ThemeProvider>
      <I18nProvider>
        <AuthProvider>
          <GuestModalContext.Provider value={{ openGuestModal }}>
            {/* Wire guest modal opener into PlayerContext */}
            <GuestModalWirer opener={openGuestModal} />
            <AppRoutes />
            {modalState.open && (
              <GuestAuthModal
                onClose={closeGuestModal}
                onContinue={modalState.onContinue}
              />
            )}
          </GuestModalContext.Provider>
        </AuthProvider>
      </I18nProvider>
    </ThemeProvider>
  );
}
