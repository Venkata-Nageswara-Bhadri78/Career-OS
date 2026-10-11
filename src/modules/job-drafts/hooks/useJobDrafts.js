import { useCallback, useEffect, useRef, useState } from "react";
import jobDraftApi from "../api/jobDraftApi";
import { JOB_DRAFT_SORT_FIELDS, JOB_DRAFTS_PAGE_SIZE } from "../config/jobDraftConfig";

export default function useJobDrafts() {
  const [drafts, setDrafts] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryAfter, setRetryAfter] = useState(null);
  const [sortBy, setSortBy] = useState("updatedAt");
  const [sortDir, setSortDir] = useState("desc");
  const [reloadKey, setReloadKey] = useState(0);
  const requestIdRef = useRef(0);

  useEffect(() => {
    const requestId = ++requestIdRef.current;
    const controller = new AbortController();
    const safeSort = JOB_DRAFT_SORT_FIELDS.includes(sortBy) ? sortBy : "updatedAt";

    jobDraftApi
      .listJobDrafts(
        {
          page,
          size: JOB_DRAFTS_PAGE_SIZE,
          sortBy: safeSort,
          sortDir: sortDir === "asc" ? "asc" : "desc",
        },
        { signal: controller.signal }
      )
      .then((res) => {
        if (requestId !== requestIdRef.current) return;
        const content = res?.content ?? [];
        setDrafts(content);
        setTotalPages(res?.totalPages ?? 0);
        setTotalElements(res?.totalElements ?? content.length);
      })
      .catch((err) => {
        if (requestId !== requestIdRef.current || err?.status === 499) return;
        setDrafts([]);
        setTotalPages(0);
        setTotalElements(0);
        setError(err?.message || "Unable to load drafts.");
        if (err?.retryAfter) setRetryAfter(err.retryAfter);
      })
      .finally(() => {
        if (requestId === requestIdRef.current) setIsLoading(false);
      });

    return () => {
      controller.abort();
    };
  }, [page, reloadKey, sortBy, sortDir]);

  const beginLoad = useCallback(() => {
    setIsLoading(true);
    setError(null);
    setRetryAfter(null);
  }, []);

  const handleSortChange = useCallback((nextSortBy) => {
    if (!JOB_DRAFT_SORT_FIELDS.includes(nextSortBy)) return;
    beginLoad();
    setSortBy(nextSortBy);
    setPage(0);
  }, [beginLoad]);

  const toggleSortDir = useCallback(() => {
    beginLoad();
    setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
    setPage(0);
  }, [beginLoad]);

  const handlePageChange = useCallback((nextPage) => {
    beginLoad();
    setPage(Math.max(0, nextPage));
  }, [beginLoad]);

  const reload = useCallback(() => {
    beginLoad();
    setReloadKey((value) => value + 1);
  }, [beginLoad]);

  const replaceDraft = useCallback((draft) => {
    if (!draft?.id) return;
    setDrafts((prev) => prev.map((row) => (row.id === draft.id ? { ...row, ...draft } : row)));
  }, []);

  const removeDraft = useCallback((draftId) => {
    setDrafts((prev) => prev.filter((row) => row.id !== draftId));
    setTotalElements((prev) => Math.max(0, prev - 1));
  }, []);

  return {
    drafts,
    page,
    totalPages,
    totalElements,
    isLoading,
    error,
    retryAfter,
    sortBy,
    sortDir,
    handleSortChange,
    toggleSortDir,
    handlePageChange,
    reload,
    replaceDraft,
    removeDraft,
  };
}
