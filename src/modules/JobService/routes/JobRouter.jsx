import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import JobDashboardPage from "../pages/JobDashboardPage";
import JobInteractPage from "../pages/JobInteractPage";

export default function JobRouter() {
  return (
    <Routes>
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<JobDashboardPage />} />
        <Route path="/jobs" element={<Navigate to="/dashboard" replace />} />
        <Route path="/jobs/:jobId/interact" element={<JobInteractPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
