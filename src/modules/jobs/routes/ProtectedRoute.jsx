import { Navigate, Outlet } from "react-router-dom";
import { isAuthenticated } from "../../auth/api/tokenStorage";

export default function ProtectedRoute() {
  const isAuth = isAuthenticated();
  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
}
