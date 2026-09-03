import { Navigate, Outlet, useLocation } from "react-router-dom";
import { AUTH_PATHS, isGuestOnlyPath } from "../config/authConfig";
import AuthBootScreen from "../components/loaders/AuthBootScreen";
import { useAuth } from "../hooks/useAuth";

export default function GuestRoute() {
  const { status } = useAuth();
  const location = useLocation();

  if (status === "booting") return <AuthBootScreen />;
  if (status === "authenticated" && isGuestOnlyPath(location.pathname)) {
    return <Navigate to={AUTH_PATHS.DASHBOARD} replace />;
  }
  return <Outlet />;
}
