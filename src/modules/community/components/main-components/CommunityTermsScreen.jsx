import { useState } from "react";
import { COMMUNITY_ACCOUNT_STATES, termsCopyFor } from "../../config/communityConstants";
import { useCommunityAccount } from "../../hooks/useCommunityAccount";
import { COMMUNITY_ERROR_KINDS, communityErrorText } from "../../utils/communityErrors";

export default function CommunityTermsScreen() {
  const { state, currentTermsVersion, account, error, accepting, accept } = useCommunityAccount();
  const copy = termsCopyFor(currentTermsVersion);
  const reaccept = state === COMMUNITY_ACCOUNT_STATES.TERMS_REACCEPTANCE_REQUIRED;
  const [confirmed, setConfirmed] = useState(false);
  const [seenVersion, setSeenVersion] = useState(currentTermsVersion);
  const blocked =
    error?.kind === COMMUNITY_ERROR_KINDS.EXTENSION_TOKEN || error?.kind === COMMUNITY_ERROR_KINDS.USERNAME_REQUIRED;

  if (seenVersion !== currentTermsVersion) {
    setSeenVersion(currentTermsVersion);
    setConfirmed(false);
  }

  const onAccept = () => {
    if (!copy || accepting || blocked || !confirmed) return;
    accept();
  };

  const previousVersion = account?.acceptedTermsVersion;

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col px-4 py-6 sm:px-6 sm:py-8">
      <h1 className="text-2xl font-bold tracking-tight text-ink">Jobs Community</h1>
      <p className="mt-2 text-sm leading-6 text-muted">
        {reaccept
          ? "These are the current community terms. A previous acceptance is not enough."
          : "A community account is created only when you accept the current terms."}
      </p>
      {reaccept && previousVersion ? (
        <p className="mt-3 text-sm leading-6 text-ink">
          Version {previousVersion} is already on your account. The version you are accepting now is {currentTermsVersion}.
        </p>
      ) : null}

      {copy ? (
        <article className="mt-5 rounded-xl border border-line bg-field px-4 py-4 text-ink">
          <h2 className="text-base font-semibold text-ink">{copy.title}</h2>
          <p className="mt-1 text-xs font-medium text-muted">Version {currentTermsVersion}</p>
          <div className="mt-3 space-y-3">
            {copy.paragraphs.map((paragraph) => (
              <p key={paragraph} className="text-sm leading-6 text-ink break-words">
                {paragraph}
              </p>
            ))}
          </div>
        </article>
      ) : (
        <div className="mt-5 rounded-xl border border-line bg-field px-4 py-4" role="alert">
          <p className="text-sm font-semibold text-ink">Terms are unavailable</p>
          <p className="mt-2 text-sm leading-6 text-muted">
            Community terms for this version are not available, so a community account cannot be created yet.
          </p>
        </div>
      )}

      {copy ? (
        <form
          className="mt-5"
          onSubmit={(event) => {
            event.preventDefault();
          }}
        >
          <label htmlFor="community-terms-confirm" className="flex items-start gap-3 text-sm leading-6 text-ink">
            <input
              id="community-terms-confirm"
              type="checkbox"
              className="mt-1"
              checked={confirmed}
              disabled={accepting || blocked}
              onChange={(event) => setConfirmed(event.target.checked)}
              aria-invalid={Boolean(error?.fieldErrors?.accepted) || undefined}
              aria-describedby={error?.fieldErrors?.accepted ? "community-accepted-error" : undefined}
            />
            <span>I have read these terms.</span>
          </label>
          {error?.fieldErrors?.accepted ? (
            <p id="community-accepted-error" className="mt-2 text-sm text-danger">
              {error.fieldErrors.accepted}
            </p>
          ) : null}
          {error?.fieldErrors?.termsVersion ? (
            <p className="mt-2 text-sm text-danger">{error.fieldErrors.termsVersion}</p>
          ) : null}
          {error ? (
            <p className="mt-3 text-sm leading-6 text-danger" role="alert">
              {communityErrorText(error)}
            </p>
          ) : null}
          <button
            type="button"
            onClick={onAccept}
            disabled={!confirmed || accepting || blocked}
            aria-busy={accepting || undefined}
            className="mt-4 inline-flex h-10 items-center justify-center rounded-xl bg-ink px-4 text-sm font-semibold text-white disabled:opacity-60"
          >
            {accepting ? "Saving…" : reaccept ? "Accept updated terms" : "Create Community Account"}
          </button>
        </form>
      ) : null}
    </div>
  );
}
