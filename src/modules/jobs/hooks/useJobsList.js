import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import jobApi from "../api/jobApi";
import {
  JOBS_FILTER_ALL,
  JOBS_MAX_FETCH_SIZE,
  JOBS_PAGE_SIZE,
  JOBS_SEARCH_DEBOUNCE_MS,
  JOBS_SEARCH_MAX_LENGTH,
} from "../config/jobsConfig";
import { applyClientFilters, paginateClient } from "../mappers/jobMapper";

function hasActiveClientFilters(filters) {
  return (
    (filters.workMode && filters.workMode !== JOBS_FILTER_ALL) ||
    (filters.employmentType && filters.employmentType !== JOBS_FILTER_ALL)
  );
}

export default function useJobsList() {
  const [jobs, setJobs] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryAfter, setRetryAfter] = useState(null);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortDir, setSortDir] = useState("desc");
  const [workModeFilter, setWorkModeFilter] = useState(JOBS_FILTER_ALL);
  const [employmentTypeFilter, setEmploymentTypeFilter] = useState(JOBS_FILTER_ALL);

  const requestIdRef = useRef(0);
  const clientFilteredCacheRef = useRef([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const trimmed = searchInput.trim().slice(0, JOBS_SEARCH_MAX_LENGTH);
      setSearch((prev) => {
        if (prev !== trimmed) setPage(0);
        return trimmed;
      });
    }, JOBS_SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const filters = useMemo(
    () => ({ workMode: workModeFilter, employmentType: employmentTypeFilter }),
    [workModeFilter, employmentTypeFilter]
  );

  const clientFiltersActive = hasActiveClientFilters(filters);

  const loadJobs = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    setIsLoading(true);
    setError(null);
    setRetryAfter(null);

    try {
      if (clientFiltersActive) {
        const res = await jobApi.getJobs({
          search: search || undefined,
          page: 0,
          size: JOBS_MAX_FETCH_SIZE,
          sortBy,
          sortDir,
        });

        if (requestId !== requestIdRef.current) return;

        const allContent = res?.content ?? [];
        const filtered = applyClientFilters(allContent, filters);
        clientFilteredCacheRef.current = filtered;
        const paged = paginateClient(filtered, page, JOBS_PAGE_SIZE);

        setJobs(paged.content);
        setTotalPages(paged.totalPages);
        setTotalElements(paged.totalElements);
      } else {
        const res = await jobApi.getJobs({
          search: search || undefined,
          page,
          size: JOBS_PAGE_SIZE,
          sortBy,
          sortDir,
        });

        if (requestId !== requestIdRef.current) return;

        const content = res?.content ?? [];
        setJobs(content);
        setTotalPages(res?.totalPages ?? 1);
        setTotalElements(res?.totalElements ?? content.length);
      }
    } catch (err) {
      if (requestId !== requestIdRef.current) return;
      setJobs([]);
      setTotalPages(1);
      setTotalElements(0);
      setError(err?.message || "Unable to load jobs.");
      if (err?.retryAfter) setRetryAfter(err.retryAfter);
    } finally {
      if (requestId === requestIdRef.current) setIsLoading(false);
    }
  }, [clientFiltersActive, filters, page, search, sortBy, sortDir]);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  const handleSearchChange = useCallback((value) => {
    setSearchInput(value.slice(0, JOBS_SEARCH_MAX_LENGTH));
  }, []);

  const handleSortChange = useCallback((nextSortBy) => {
    setSortBy(nextSortBy);
    setPage(0);
  }, []);

  const toggleSortDir = useCallback(() => {
    setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
    setPage(0);
  }, []);

  const handleWorkModeFilterChange = useCallback((value) => {
    setWorkModeFilter(value);
    setPage(0);
  }, []);

  const handleEmploymentTypeFilterChange = useCallback((value) => {
    setEmploymentTypeFilter(value);
    setPage(0);
  }, []);

  const clearFilters = useCallback(() => {
    setWorkModeFilter(JOBS_FILTER_ALL);
    setEmploymentTypeFilter(JOBS_FILTER_ALL);
    setPage(0);
  }, []);

  const handlePageChange = useCallback((nextPage) => {
    setPage(Math.max(0, nextPage));
  }, []);

  const upsertJobInList = useCallback((updatedJob) => {
    if (!updatedJob?.id) return;
    setJobs((prev) => prev.map((job) => (job.id === updatedJob.id ? { ...job, ...updatedJob } : job)));
    if (clientFiltersActive) {
      clientFilteredCacheRef.current = clientFilteredCacheRef.current.map((job) =>
        job.id === updatedJob.id ? { ...job, ...updatedJob } : job
      );
    }
  }, [clientFiltersActive]);

  const removeJobFromList = useCallback((jobId) => {
    setJobs((prev) => prev.filter((job) => job.id !== jobId));
    setTotalElements((prev) => Math.max(0, prev - 1));
    if (clientFiltersActive) {
      clientFilteredCacheRef.current = clientFilteredCacheRef.current.filter((job) => job.id !== jobId);
    }
  }, [clientFiltersActive]);

  const prependJob = useCallback((createdJob) => {
    if (!createdJob?.id) return;
    if (page === 0 && !clientFiltersActive && !search) {
      setJobs((prev) => [createdJob, ...prev].slice(0, JOBS_PAGE_SIZE));
    }
    setTotalElements((prev) => prev + 1);
  }, [clientFiltersActive, page, search]);

  return {
    jobs,
    page,
    totalPages,
    totalElements,
    isLoading,
    error,
    retryAfter,
    searchInput,
    sortBy,
    sortDir,
    workModeFilter,
    employmentTypeFilter,
    clientFiltersActive,
    handleSearchChange,
    handleSortChange,
    toggleSortDir,
    handleWorkModeFilterChange,
    handleEmploymentTypeFilterChange,
    clearFilters,
    handlePageChange,
    reload: loadJobs,
    upsertJobInList,
    removeJobFromList,
    prependJob,
  };
}
