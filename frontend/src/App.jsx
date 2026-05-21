import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useEffect } from "react";
import useAuthStore from "./store/authStore";
import useSocket from "./hooks/useSocket";
import useNotifStore from "./store/notifStore";
import useSettingsStore from "./store/settingsStore";

// Pages
import AuthPage from "./pages/AuthPage";
import HomePage from "./pages/HomePage";
import ProfilePage from "./pages/ProfilePage";
import ExplorePage from "./pages/ExplorePage";
import ChatPage from "./pages/ChatPage";
import NotificationsPage from "./pages/NotificationsPage";
import PostDetailPage from "./pages/PostDetailPage";
import SettingsPage from "./pages/SettingsPage";

// Layout
import MainLayout from "./components/layout/MainLayout";

// Protected route wrapper
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? children : <Navigate to="/auth" replace />;
};

const AppContent = () => {
  const { isAuthenticated, hydrateUser } = useAuthStore();
  const { fetchUnreadCount } = useNotifStore();
  const { theme } = useSettingsStore();
  useSocket(); // init socket connection

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = theme;
    root.classList.toggle("theme-light", theme === "white");
    root.classList.toggle("theme-blueblack", theme !== "white");
  }, [theme]);

  useEffect(() => {
    hydrateUser();
  }, []);

  useEffect(() => {
    if (isAuthenticated) fetchUnreadCount();
  }, [isAuthenticated]);

  return (
    <Routes>
      <Route path="/auth" element={!isAuthenticated ? <AuthPage /> : <Navigate to="/" replace />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<HomePage />} />
        <Route path="explore" element={<ExplorePage />} />
        <Route path="chat" element={<ChatPage />} />
        <Route path="chat/:userId" element={<ChatPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="profile/:username" element={<ProfilePage />} />
        <Route path="post/:postId" element={<PostDetailPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App = () => (
  <BrowserRouter>
    <AppContent />
    <Toaster
      position="bottom-right"
      toastOptions={{
        style: {
          background: "#0b1220",
          color: "#e2e8f0",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "12px",
          fontSize: "14px",
        },
        success: { iconTheme: { primary: "#3b82f6", secondary: "#fff" } },
      }}
    />
  </BrowserRouter>
);

export default App;
