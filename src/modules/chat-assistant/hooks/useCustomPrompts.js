import { useCallback, useEffect, useRef, useState } from "react";
import {
  createCustomPrompt,
  deleteCustomPrompt,
  listCustomPrompts,
  updateCustomPrompt,
} from "../api/customPromptApi";
import {
  mapCustomPrompt,
  mapCustomPromptError,
  mapCustomPromptList,
  toCustomPromptRequest,
  upsertCustomPrompt,
} from "../mappers/customPromptMapper";

export default function useCustomPrompts({ autoLoad = true } = {}) {
  const [prompts, setPrompts] = useState([]);
  const [status, setStatus] = useState(autoLoad ? "loading" : "idle");
  const [error, setError] = useState(null);
  const [busyKey, setBusyKey] = useState(null);
  const requestRef = useRef(0);
  const abortRef = useRef(null);

  const load = useCallback(async () => {
    const requestId = ++requestRef.current;
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setStatus((current) => (current === "ready" ? "ready" : "loading"));
    setError(null);
    try {
      const rows = await listCustomPrompts({ signal: controller.signal });
      if (requestId !== requestRef.current) return [];
      const mapped = mapCustomPromptList(rows);
      setPrompts(mapped);
      setStatus("ready");
      setError(null);
      return mapped;
    } catch (err) {
      if (err?.status === 499 || requestId !== requestRef.current) return [];
      const mapped = mapCustomPromptError(err);
      setError(mapped);
      setStatus("error");
      throw mapped;
    }
  }, []);

  useEffect(() => {
    if (!autoLoad) return undefined;
    const controller = new AbortController();
    const requestId = ++requestRef.current;
    abortRef.current = controller;
    (async () => {
      try {
        const rows = await listCustomPrompts({ signal: controller.signal });
        if (requestId !== requestRef.current) return;
        setPrompts(mapCustomPromptList(rows));
        setStatus("ready");
        setError(null);
      } catch (err) {
        if (err?.status === 499 || requestId !== requestRef.current) return;
        setError(mapCustomPromptError(err));
        setStatus("error");
      }
    })();
    return () => {
      controller.abort();
    };
  }, [autoLoad]);

  const create = useCallback(async (title, prompt) => {
    setBusyKey("create");
    try {
      const created = mapCustomPrompt(await createCustomPrompt(toCustomPromptRequest(title, prompt)));
      if (!created) throw mapCustomPromptError({ status: 500, message: "" });
      setPrompts((rows) => upsertCustomPrompt(rows, created));
      setError(null);
      setStatus("ready");
      return created;
    } catch (err) {
      const mapped = err?.stale != null ? err : mapCustomPromptError(err);
      if (mapped.stale) await load().catch(() => {});
      throw mapped;
    } finally {
      setBusyKey(null);
    }
  }, [load]);

  const update = useCallback(async (id, title, prompt) => {
    setBusyKey(id);
    try {
      const updated = mapCustomPrompt(await updateCustomPrompt(id, toCustomPromptRequest(title, prompt)));
      if (!updated) throw mapCustomPromptError({ status: 500, message: "" });
      setPrompts((rows) => upsertCustomPrompt(rows, updated));
      setError(null);
      setStatus("ready");
      return updated;
    } catch (err) {
      const mapped = err?.stale != null ? err : mapCustomPromptError(err);
      if (mapped.stale) await load().catch(() => {});
      throw mapped;
    } finally {
      setBusyKey(null);
    }
  }, [load]);

  const remove = useCallback(async (id) => {
    setBusyKey(id);
    try {
      await deleteCustomPrompt(id);
      setPrompts((rows) => rows.filter((row) => row.id !== id));
      setError(null);
      return true;
    } catch (err) {
      const mapped = mapCustomPromptError(err);
      if (mapped.stale) {
        setPrompts((rows) => rows.filter((row) => row.id !== id));
        return true;
      }
      throw mapped;
    } finally {
      setBusyKey(null);
    }
  }, []);

  return {
    prompts,
    status,
    error,
    busyKey,
    isLoading: status === "loading",
    load,
    create,
    update,
    remove,
  };
}
