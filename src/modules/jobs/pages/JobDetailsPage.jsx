import { useNavigate, useParams } from "react-router-dom";
import { APP_PATHS } from "../../../common/config/appPaths";
import JobDetailsDrawer from "../components/main-components/JobDetailsDrawer";

export default function JobDetailsPage() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const id = Number.parseInt(String(jobId || ""), 10);
  const validId = Number.isFinite(id) && id > 0 ? id : null;

  return (
    <JobDetailsDrawer
      variant="page"
      isOpen
      jobId={validId}
      onClose={() => navigate(APP_PATHS.DASHBOARD)}
    />
  );
}
