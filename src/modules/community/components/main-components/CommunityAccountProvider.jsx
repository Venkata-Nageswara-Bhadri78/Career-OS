import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "../../../auth/hooks/useAuth";
import { acceptCommunityTerms, getCommunityAccount } from "../../api/communityApi";
import { disconnectCommunitySocket } from "../../api/communitySocket";
import { COMMUNITY_ACCOUNT_STATES, termsCopyFor } from "../../config/communityConstants";
import { CommunityAccountContext } from "../../hooks/communityAccountContext";
import { classifyCommunityError } from "../../utils/communityErrors";

const CLEARED = Object.freeze({
  status: "idle",
  state: null,
  currentTermsVersion: null,
  account: null,
  error: null,
  accepting: false,
});

const INITIAL = {
  status: "checking",
  state: null,
  currentTermsVersion: null,
  account: null,
  error: null,
  accepting: false,
};

function isAbort(signal, error) {
  return Boolean(signal?.aborted) || error?.status === 499;
}

export default function CommunityAccountProvider({ children }) {
  const { status: authStatus } = useAuth();
  const [account, setAccount] = useState(INITIAL);
  const generation = useRef(0);
  const abortRef = useRef(null);
  const acceptAbortRef = useRef(null);
  const acceptingRef = useRef(false);
  const authStatusRef = useRef(authStatus);

  useEffect(() => {
    authStatusRef.current = authStatus;
    if (authStatus !== "authenticated") {
      disconnectCommunitySocket();
    }
  }, [authStatus]);

  if (authStatus !== "authenticated" && account.status !== "idle") {
    setAccount(CLEARED);
  }

  const load = useCallback(async (signal) => {
    const requestId = ++generation.current;
    acceptingRef.current = false;
    setAccount((current) => ({
      ...current,
      status: "checking",
      error: null,
      accepting: false,
    }));
    try {
      const consent = await getCommunityAccount({ signal });
      if (isAbort(signal) || requestId !== generation.current || authStatusRef.current !== "authenticated") return;
      setAccount({
        status: "ready",
        state: consent?.state ?? null,
        currentTermsVersion: consent?.currentTermsVersion ?? null,
        account: consent?.account ?? null,
        error: null,
        accepting: false,
      });
    } catch (error) {
      const classified = classifyCommunityError(error);
      if (isAbort(signal, classified) || requestId !== generation.current || authStatusRef.current !== "authenticated") return;
      setAccount((current) => ({
        ...current,
        status: "error",
        error: classified,
        accepting: false,
      }));
    }
  }, []);

  const refresh = useCallback(() => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    return load(controller.signal);
  }, [load]);

  const accept = useCallback(async (termsVersion) => {
    if (acceptingRef.current) return;
    if (typeof termsVersion !== "string" || !termsCopyFor(termsVersion)) return;
    const requestId = ++generation.current;
    acceptAbortRef.current?.abort();
    const controller = new AbortController();
    acceptAbortRef.current = controller;
    acceptingRef.current = true;
    setAccount((current) => ({ ...current, accepting: true, error: null }));
    try {
      const consent = await acceptCommunityTerms({ termsVersion, signal: controller.signal });
      if (requestId !== generation.current || authStatusRef.current !== "authenticated") return;
      if (consent?.state === COMMUNITY_ACCOUNT_STATES.ACCOUNT_ACTIVE) {
        setAccount({
          status: "ready",
          state: consent.state,
          currentTermsVersion: consent.currentTermsVersion ?? termsVersion,
          account: consent.account ?? null,
          error: null,
          accepting: false,
        });
        return;
      }
      setAccount((current) => ({
        ...current,
        status: "ready",
        accepting: false,
        error: classifyCommunityError({
          message: "Jobs Community could not confirm the account.",
          status: 200,
          data: null,
        }),
      }));
    } catch (error) {
      const classified = classifyCommunityError(error);
      if (requestId !== generation.current || authStatusRef.current !== "authenticated") return;
      if (classified.status === 499) {
        setAccount((current) => ({ ...current, accepting: false }));
        return;
      }
      setAccount((current) => ({
        ...current,
        status: "ready",
        accepting: false,
        error: classified,
      }));
    } finally {
      if (requestId === generation.current) acceptingRef.current = false;
    }
  }, []);

  useEffect(() => {
    if (authStatus !== "authenticated") return undefined;
    const controller = new AbortController();
    abortRef.current = controller;
    const frame = window.requestAnimationFrame(() => {
      void load(controller.signal);
    });
    return () => {
      window.cancelAnimationFrame(frame);
      controller.abort();
      acceptAbortRef.current?.abort();
      generation.current += 1;
    };
  }, [authStatus, load]);

  const value = useMemo(
    () => ({
      status: account.status,
      state: account.state,
      currentTermsVersion: account.currentTermsVersion,
      account: account.account,
      error: account.error,
      accepting: account.accepting,
      accept: () => accept(account.currentTermsVersion),
      refresh,
    }),
    [account, accept, refresh]
  );

  return <CommunityAccountContext.Provider value={value}>{children}</CommunityAccountContext.Provider>;
}
