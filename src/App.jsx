import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AuthLayout from "./modules/auth/components/main-components/AuthLayout";
import LoginPage from "./modules/auth/pages/LoginPage";
import SignUpPage from "./modules/auth/pages/SignUpPage";
import ForgotPasswordPage from "./modules/auth/pages/ForgotPasswordPage";
import ResetPasswordPage from "./modules/auth/pages/ResetPasswordPage";
import VerifyEmailPage from "./modules/auth/pages/VerifyEmailPage";
import ProtectedRoute from "./modules/jobs/routes/ProtectedRoute";
import JobIndex from "./modules/jobs/components/JobIndex";
import ChatAssistantIndex from "./modules/chat-assistant/components/ChatAssistantIndex";
import UserProfileIndex from "./modules/user/components/UserProfileIndex";
import MainLayout from "./common/components/layout/MainLayout";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<SignUpPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<JobIndex />} />
            <Route path="/profile" element={<UserProfileIndex />} />
            <Route path="/jobs" element={<Navigate to="/dashboard" replace />} />
            <Route path="/jobs/:jobId/interact" element={<ChatAssistantIndex />} />
            <Route path="/ai" element={<ChatAssistantIndex />} />
          </Route>
        </Route>

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
