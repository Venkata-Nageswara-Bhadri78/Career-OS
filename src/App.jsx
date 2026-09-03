import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import ThemeProvider from "./common/theme/ThemeProvider";
import AuthProvider from "./modules/auth/hooks/AuthProvider";
import { AuthRouteTree } from "./modules/auth/routes/authRoutes";
import ProtectedRoute from "./modules/auth/routes/ProtectedRoute";
import MainLayout from "./common/components/layout/MainLayout";
import LandingPage from "./common/landing/LandingPage";
import SettingsPage from "./common/settings/SettingsPage";
import TermsPage from "./common/legal/TermsPage";
import PrivacyPage from "./common/legal/PrivacyPage";
import JobIndex from "./modules/jobs/components/JobIndex";
import ChatAssistantIndex from "./modules/chat-assistant/components/ChatAssistantIndex";
import UserProfileIndex from "./modules/user/components/UserProfileIndex";

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            {AuthRouteTree()}

            <Route element={<ProtectedRoute />}>
              <Route element={<MainLayout />}>
                <Route path="/dashboard" element={<JobIndex />} />
                <Route path="/profile" element={<UserProfileIndex />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/jobs" element={<Navigate to="/dashboard" replace />} />
                <Route path="/jobs/:jobId/interact" element={<ChatAssistantIndex />} />
                <Route path="/ai" element={<ChatAssistantIndex />} />
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
