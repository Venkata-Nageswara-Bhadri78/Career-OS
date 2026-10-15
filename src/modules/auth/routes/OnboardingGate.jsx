import { Navigate, useLocation } from "react-router-dom";
import { AUTH_PATHS } from "../config/authConfig";
import { useAuth } from "../hooks/useAuth";

function normalizePath(pathname) {
  if (!pathname || pathname === "/") return "/";
  return pathname.replace(/\/+$/, "") || "/";
}

export default function OnboardingGate({ children }) {
  const { status, needsUsername } = useAuth();
  const location = useLocation();
  const path = normalizePath(location.pathname);

  if (status === "authenticated" && needsUsername && path !== AUTH_PATHS.PRE_COMPLETE) {
    return <Navigate to={AUTH_PATHS.PRE_COMPLETE} replace />;
  }

  return children;
}
