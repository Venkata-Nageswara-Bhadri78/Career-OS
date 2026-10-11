import { useCallback, useEffect, useRef, useState } from "react";
import { persistViewMode, readStoredViewMode } from "../config/jobsConfig";

const MOBILE_VIEW_QUERY = "(max-width: 767px)";

function useIsMobileDashboard() {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia(MOBILE_VIEW_QUERY).matches : false
  );

  useEffect(() => {
    const media = window.matchMedia(MOBILE_VIEW_QUERY);
    const onChange = () => setIsMobile(media.matches);
    onChange();
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  return isMobile;
}

export default function useJobsViewMode() {
  const [viewMode, setViewModeState] = useState(readStoredViewMode);
  const isMobile = useIsMobileDashboard();

  const setViewMode = useCallback((mode) => {
    const next = mode === "grid" ? "grid" : "list";
    setViewModeState(next);
    persistViewMode(next);
  }, []);

  return { viewMode, displayViewMode: isMobile ? "grid" : viewMode, setViewMode };
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
