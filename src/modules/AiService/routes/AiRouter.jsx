import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "../../JobService/routes/ProtectedRoute";
import AiChatPage from "../pages/AiChatPage";

export default function AiRouter() {
  return (
    <Routes>
      <Route element={<ProtectedRoute />}>
        <Route path="/jobs/:jobId/interact" element={<AiChatPage />} />
        <Route path="/ai" element={<AiChatPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
