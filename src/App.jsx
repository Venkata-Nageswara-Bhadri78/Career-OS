import { useEffect, useMemo, useRef, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import ThemeProvider from "./common/theme/ThemeProvider";
import AuthProvider from "./modules/auth/hooks/AuthProvider";
import { AuthRouteTree } from "./modules/auth/routes/authRoutes";
import ProtectedRoute from "./modules/auth/routes/ProtectedRoute";
import AuthBootScreen from "./modules/auth/components/loaders/AuthBootScreen";
import { useAuth } from "./modules/auth/hooks/useAuth";
import MainLayout from "./common/components/layout/MainLayout";
import ChatHistorySlotProvider from "./common/components/layout/ChatHistorySlotProvider";
import ShellSessionProvider from "./common/session/ShellSessionProvider";
import { APP_PATHS } from "./common/config/appPaths";
import { CommonProtectedRoutes, CommonPublicRoutes } from "./common/routes/commonRoutes";
import LandingPage from "./common/pages/LandingPage";
import JobDashboardPage from "./modules/jobs/pages/JobDashboardPage";
import JobDraftsPage from "./modules/job-drafts/pages/JobDraftsPage";
import AddJobModal from "./modules/job-extraction/components/main-components/AddJobModal";
import {
  ChatAssistantRouteTree,
  ChatHistoryShellBinder,
} from "./modules/chat-assistant/routes/chatAssistantRoutes";
import { AiRouteTree } from "./modules/ai/routes/aiRoutes";
import { UserRouteTree } from "./modules/user/routes/userRoutes";

function LandingRoute() {
  const { isAuthenticated, isBooting } = useAuth();
  if (isBooting) return <AuthBootScreen />;
  if (isAuthenticated) return <Navigate to={APP_PATHS.DASHBOARD} replace />;
  return <LandingPage />;
}

function ProtectedAppShell() {
  const { user, signOut, signOutAll } = useAuth();
  const session = useMemo(() => ({ user, signOut, signOutAll }), [user, signOut, signOutAll]);

  return (
    <ShellSessionProvider value={session}>
      <ChatHistorySlotProvider>
        <ChatHistoryShellBinder />
        <MainLayout />
      </ChatHistorySlotProvider>
    </ShellSessionProvider>
  );
}

function JobsDashboardEntry() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [openJob, setOpenJob] = useState(null);
  const [seenNavJobId, setSeenNavJobId] = useState(null);
  const createJobRef = useRef(null);
  const incomingJob = location.state?.openJob;
  const incomingJobId = incomingJob?.id ?? null;

  if (incomingJobId && incomingJobId !== seenNavJobId) {
    setSeenNavJobId(incomingJobId);
    setOpenJob(incomingJob);
  }

  useEffect(() => {
    if (!incomingJobId) return;
    navigate(location.pathname, { replace: true, state: null });
  }, [incomingJobId, location.pathname, navigate]);

  return (
    <>
      <JobDashboardPage
        onAddJob={() => setIsAddModalOpen(true)}
        registerCreateJob={(handler) => {
          createJobRef.current = handler;
        }}
        openJob={openJob}
        onOpenJobHandled={() => setOpenJob(null)}
      />
      <AddJobModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={async (payload) => {
          if (createJobRef.current) {
            await createJobRef.current(payload);
          }
        }}
        onJobPersisted={(job) => setOpenJob(job)}
        onOpenDraft={(draftId) => {
          setIsAddModalOpen(false);
          navigate(`${APP_PATHS.JOB_DRAFTS}/${draftId}`);
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
            {CommonPublicRoutes({ landingElement: <LandingRoute /> })}
            {AuthRouteTree()}

            <Route element={<ProtectedRoute />}>
              <Route element={<ProtectedAppShell />}>
                <Route path={APP_PATHS.DASHBOARD} element={<JobsDashboardEntry />} />
                <Route path={APP_PATHS.JOB_DRAFTS} element={<JobDraftsPage />} />
                <Route path={`${APP_PATHS.JOB_DRAFTS}/:draftId`} element={<JobDraftsPage />} />
                {UserRouteTree()}
                {CommonProtectedRoutes()}
                <Route path="/jobs" element={<Navigate to={APP_PATHS.DASHBOARD} replace />} />
                {ChatAssistantRouteTree()}
                {AiRouteTree()}
              </Route>
            </Route>

            <Route path="*" element={<Navigate to={APP_PATHS.LANDING} replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
