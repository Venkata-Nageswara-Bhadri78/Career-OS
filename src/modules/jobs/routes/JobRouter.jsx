import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import JobDashboardPage from "../pages/JobDashboardPage";
import AiIndex from "../../ai/components/AiIndex";

export default function JobRouter() {
  return (
    <Routes>
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<JobDashboardPage />} />
        <Route path="/jobs" element={<Navigate to="/dashboard" replace />} />
        <Route path="/jobs/:jobId/interact" element={<AiIndex />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
