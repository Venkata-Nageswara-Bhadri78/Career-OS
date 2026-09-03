import { Route } from "react-router-dom";
import AuthLayout from "../components/main-components/AuthLayout";
import ForgotPasswordPage from "../pages/ForgotPasswordPage";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import ResetPasswordPage from "../pages/ResetPasswordPage";
import VerifyEmailPage from "../pages/VerifyEmailPage";
import GuestRoute from "./GuestRoute";

export { AUTH_PATHS } from "../config/authConfig";
export { default as ProtectedRoute } from "./ProtectedRoute";
export { default as GuestRoute } from "./GuestRoute";

export function AuthRouteTree() {
  return (
    <Route element={<GuestRoute />}>
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/signup" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
      </Route>
    </Route>
  );
}
