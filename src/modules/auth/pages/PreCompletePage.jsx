import { Navigate } from "react-router-dom";
import { AUTH_PATHS } from "../config/authConfig";
import PreCompleteForm from "../components/main-components/PreCompleteForm";
import { useAuth } from "../hooks/useAuth";

export default function PreCompletePage() {
  const { needsUsername } = useAuth();
  if (!needsUsername) return <Navigate to={AUTH_PATHS.DASHBOARD} replace />;
  return <PreCompleteForm />;
}
