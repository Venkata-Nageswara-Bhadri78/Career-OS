import { Navigate, Outlet, useLocation } from "react-router-dom";
import { AUTH_PATHS } from "../config/authConfig";
import AuthBootScreen from "../components/loaders/AuthBootScreen";
import { useAuth } from "../hooks/useAuth";

export default function ProtectedRoute() {
  const { status } = useAuth();
  const location = useLocation();

  if (status === "booting") return <AuthBootScreen />;
  if (status !== "authenticated") {
    return <Navigate to={AUTH_PATHS.LOGIN} replace state={{ from: location.pathname }} />;
  }
  return <Outlet />;
}
