import { Link, useParams } from "react-router-dom";
import { APP_PATHS } from "../../../common/config/appPaths";
import CommunityCreateForm from "../components/main-components/CommunityCreateForm";
import CommunityMatchCard from "../components/main-components/CommunityMatchCard";
import CommunityStatusPanel from "../components/sub-components/CommunityStatusPanel";
import { useCommunityDiscovery } from "../hooks/useCommunityDiscovery";
import { canRetryCommunityAccount, communityErrorText } from "../utils/communityErrors";

export default function CommunityStartPage() {
  const { jobId } = useParams();
  const discovery = useCommunityDiscovery(jobId);

  if (discovery.status === "loading") {
    return (
      <CommunityStatusPanel
        title="Opening this job"
        message="Checking whether a community already exists for this posting."
        busy
      />
    );
  }

  if (discovery.status === "error") {
    const retry = canRetryCommunityAccount(discovery.loadError) ? discovery.retry : null;
    return (
      <CommunityStatusPanel title="This saved job is unavailable" message={communityErrorText(discovery.loadError)} alert>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          {retry ? (
            <button
              type="button"
              onClick={retry}
              className="inline-flex h-10 items-center justify-center rounded-xl bg-ink px-4 text-sm font-semibold text-white"
            >
              Try again
            </button>
          ) : null}
          <Link
            to={APP_PATHS.DASHBOARD}
            className="inline-flex h-10 items-center justify-center rounded-xl border border-line bg-white px-4 text-sm font-semibold text-ink"
          >
            Back to saved jobs
          </Link>
        </div>
      </CommunityStatusPanel>
    );
  }

  if (discovery.mode === "existing") {
    return (
      <CommunityMatchCard
        summary={discovery.summary}
        notice={discovery.notice}
        actionError={discovery.actionError}
        onOpen={discovery.openSummary}
        onJoin={discovery.joinSummary}
        onCancel={discovery.cancel}
        onEdit={discovery.fromForm ? discovery.editUrls : null}
      />
    );
  }

  return (
    <CommunityCreateForm
      form={discovery.form}
      fieldErrors={discovery.fieldErrors}
      formError={discovery.formError}
      notice={discovery.notice}
      refineNote={discovery.refineNote}
      phase={discovery.phase}
      canCreate={discovery.canCreate}
      onField={discovery.updateField}
      onAlternative={discovery.updateAlternative}
      onAddAlternative={discovery.addAlternative}
      onRemoveAlternative={discovery.removeAlternative}
      onCreate={discovery.create}
      onCheckUrls={discovery.checkUrls}
      onRefine={discovery.refine}
      onCancel={discovery.cancel}
    />
  );
}
