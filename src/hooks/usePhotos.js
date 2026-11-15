import { useCallback, useEffect, useRef, useState } from "react";
import { fetchPhotos } from "../api/photos.js";

export function usePhotos(
  fetchPage = fetchPhotos,
  { pageLimit = Infinity } = {},
) {
  const [state, setState] = useState({
    photos: [],
    status: "loading",
    hasMore: true,
    loadedPage: 0,
    error: null,
  });
  const request = useRef({
    page: 1,
    busy: false,
    failed: false,
    done: false,
    version: 0,
  });

  const loadNext = useCallback(
    async (retry = false) => {
      const current = request.current;
      if (current.busy || current.done || (current.failed && !retry)) return;
      current.busy = true;
      current.failed = false;
      const version = ++current.version;
      const controller = new AbortController();
      current.controller = controller;
      setState((previous) => ({ ...previous, status: "loading", error: null }));
      try {
        const batch = await fetchPage(current.page, controller.signal);
        if (version !== current.version || controller.signal.aborted) return;
        const loadedPage = current.page;
        current.page += 1;
        current.done = batch.length === 0 || loadedPage >= pageLimit;
        const hasMore = !current.done;
        setState((previous) => {
          const ids = new Set(previous.photos.map((photo) => photo.id));
          const additions = batch.filter((photo) => {
            if (ids.has(photo.id)) return false;
            ids.add(photo.id);
            return true;
          });
          return {
            photos: [...previous.photos, ...additions],
            status: "ready",
            hasMore,
            loadedPage,
            error: null,
          };
        });
      } catch (error) {
        if (version !== current.version || controller.signal.aborted) return;
        current.failed = true;
        setState((previous) => ({ ...previous, status: "error", error }));
      } finally {
        if (version === current.version) current.busy = false;
      }
    },
    [fetchPage, pageLimit],
  );

  useEffect(() => {
    loadNext();
    return () => {
      request.current.controller?.abort();
      request.current.version += 1;
      request.current.busy = false;
    };
  }, [loadNext]);

  const retry = useCallback(() => loadNext(true), [loadNext]);
  return { ...state, loadNext, retry };
}
