import { useCallback, useEffect, useRef, useState } from "react";
import { persistViewMode, readStoredViewMode } from "../config/jobsConfig";

export default function useJobsViewMode() {
  const [viewMode, setViewModeState] = useState(readStoredViewMode);

  const setViewMode = useCallback((mode) => {
    const next = mode === "grid" ? "grid" : "list";
    setViewModeState(next);
    persistViewMode(next);
  }, []);

  return { viewMode, setViewMode };
}

export function useDismissibleMessage(initialMs = 3500) {
  const [message, setMessage] = useState(null);
  const timerRef = useRef(null);

  const showMessage = useCallback(
    (text) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      setMessage(text);
      timerRef.current = setTimeout(() => setMessage(null), initialMs);
    },
    [initialMs]
  );

  const dismiss = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setMessage(null);
  }, []);

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    []
  );

  return { message, showMessage, dismiss };
}
