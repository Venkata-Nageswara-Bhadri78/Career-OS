import { useEffect } from "react";
import { COMMUNITY_ACCOUNT_STATES } from "../../config/communityConstants";
import { useCommunityAccount } from "../../hooks/useCommunityAccount";
import { canRetryCommunityAccount, communityErrorText } from "../../utils/communityErrors";
import CommunityStatusPanel from "../sub-components/CommunityStatusPanel";
import CommunityTermsScreen from "./CommunityTermsScreen";

const KNOWN_STATES = new Set([
  COMMUNITY_ACCOUNT_STATES.ACCOUNT_ACTIVE,
  COMMUNITY_ACCOUNT_STATES.TERMS_ACCEPTANCE_REQUIRED,
  COMMUNITY_ACCOUNT_STATES.TERMS_REACCEPTANCE_REQUIRED,
]);

export default function CommunityAccountGate({ children }) {
  const { status, state, error, refresh } = useCommunityAccount();

  useEffect(() => {
    if (status !== "ready" || !state || KNOWN_STATES.has(state)) return;
    console.warn("community account state unrecognized", { state });
  }, [status, state]);

  if (status === "checking" || status === "idle") {
    return (
      <CommunityStatusPanel title="Checking your community account" message="Confirming whether the community terms are accepted." busy />
    );
  }

  if (status === "error") {
    const retry = canRetryCommunityAccount(error) ? refresh : null;
    return (
      <CommunityStatusPanel title="Jobs Community is unavailable" message={communityErrorText(error)} alert>
        {retry ? (
          <button
            type="button"
            onClick={retry}
            className="mt-4 inline-flex h-10 items-center justify-center rounded-xl bg-ink px-4 text-sm font-semibold text-white"
          >
            Try again
          </button>
        ) : null}
      </CommunityStatusPanel>
    );
  }

  if (state === COMMUNITY_ACCOUNT_STATES.ACCOUNT_ACTIVE) return children;

  if (
    state === COMMUNITY_ACCOUNT_STATES.TERMS_ACCEPTANCE_REQUIRED ||
    state === COMMUNITY_ACCOUNT_STATES.TERMS_REACCEPTANCE_REQUIRED
  ) {
    return <CommunityTermsScreen />;
  }

  return (
    <CommunityStatusPanel
      title="Jobs Community is unavailable"
      message="This community account could not be opened."
      alert
    />
  );
}
