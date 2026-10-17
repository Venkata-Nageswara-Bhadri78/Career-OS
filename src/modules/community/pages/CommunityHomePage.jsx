import { Link, useLocation } from "react-router-dom";
import { APP_PATHS } from "../../../common/config/appPaths";

export default function CommunityHomePage() {
  const location = useLocation();
  const leftNotice = typeof location.state?.communityLeft === "string" ? location.state.communityLeft : "";

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col px-4 py-6 sm:px-6 sm:py-8">
      <h1 className="text-2xl font-bold tracking-tight text-ink">Jobs Community</h1>
      {leftNotice ? (
        <p className="mt-4 rounded-xl border border-line bg-field px-4 py-3 text-sm leading-6 text-ink" role="status">
          {leftNotice}
        </p>
      ) : null}
      <div className="mt-5 rounded-xl border border-line bg-field px-4 py-4">
        <p className="text-sm leading-6 text-ink">
          A community is the shared chat for one job posting. Open it from a saved job. Communities you belong to are
          listed in the sidebar.
        </p>
        <Link
          to={APP_PATHS.DASHBOARD}
          className="mt-4 inline-flex h-10 items-center justify-center rounded-xl bg-ink px-4 text-sm font-semibold text-white"
        >
          Go to saved jobs
        </Link>
      </div>
    </div>
  );
}
