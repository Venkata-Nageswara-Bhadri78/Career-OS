import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AuthLayout from "./modules/AuthService/components/main-components/AuthLayout";
import LoginPage from "./modules/AuthService/pages/LoginPage";
import SignUpPage from "./modules/AuthService/pages/SignUpPage";
import ForgotPasswordPage from "./modules/AuthService/pages/ForgotPasswordPage";
import ResetPasswordPage from "./modules/AuthService/pages/ResetPasswordPage";
import VerifyEmailPage from "./modules/AuthService/pages/VerifyEmailPage";
import ProtectedRoute from "./modules/JobService/routes/ProtectedRoute";
import JobIndex from "./modules/JobService/components/JobIndex";
import AiIndex from "./modules/AiService/components/AiIndex";

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
          <Route path="/dashboard" element={<JobIndex />} />
          <Route path="/jobs" element={<Navigate to="/dashboard" replace />} />
          <Route path="/jobs/:jobId/interact" element={<AiIndex />} />
          <Route path="/ai" element={<AiIndex />} />
        </Route>

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
