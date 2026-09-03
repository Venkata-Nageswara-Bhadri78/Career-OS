import { useRef, useState } from "react";
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
import JobDashboardPage from "./modules/jobs/pages/JobDashboardPage";
import AddJobModal from "./modules/job-extraction/components/main-components/AddJobModal";
import ChatAssistantIndex from "./modules/chat-assistant/components/ChatAssistantIndex";
import UserProfileIndex from "./modules/user/components/UserProfileIndex";

function JobsDashboardEntry() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const createJobRef = useRef(null);

  return (
    <>
      <JobDashboardPage
        onAddJob={() => setIsAddModalOpen(true)}
        registerCreateJob={(handler) => {
          createJobRef.current = handler;
        }}
      />
      <AddJobModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={async (payload) => {
          if (createJobRef.current) {
            await createJobRef.current(payload);
          }
        }}
      />
    </>
  );
}

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
                <Route path="/dashboard" element={<JobsDashboardEntry />} />
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
