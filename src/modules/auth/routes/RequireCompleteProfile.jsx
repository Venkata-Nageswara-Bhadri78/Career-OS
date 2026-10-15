import { Navigate, Outlet } from "react-router-dom";
import { AUTH_PATHS } from "../config/authConfig";
import AuthBootScreen from "../components/loaders/AuthBootScreen";
import { useAuth } from "../hooks/useAuth";

export default function RequireCompleteProfile() {
  const { status, needsUsername } = useAuth();

  if (status === "booting") return <AuthBootScreen />;
  if (needsUsername) return <Navigate to={AUTH_PATHS.PRE_COMPLETE} replace />;
  return <Outlet />;
}
