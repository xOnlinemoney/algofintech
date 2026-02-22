"use client";

import { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import type { Algorithm } from "@/lib/types";

/* eslint-disable @typescript-eslint/no-explicit-any */

interface SavedAlgorithmsContextValue {
  savedIds: Set<string>;
  savedAlgorithms: Algorithm[];
  addAlgorithm: (id: string) => void;
  removeAlgorithm: (id: string) => void;
  isSaved: (id: string) => boolean;
}

const SavedAlgorithmsContext = createContext<SavedAlgorithmsContextValue | null>(
  null
);

/** Build a localStorage key scoped to the logged-in agency */
function getStorageKey(): string | null {
  try {
    const raw = localStorage.getItem("agency_session");
    if (!raw) return null;
    const session = JSON.parse(raw);
    if (session.agency_id) return `saved_algos_${session.agency_id}`;
  } catch {
    /* ignore */
  }
  return null;
}

/** Read saved IDs from localStorage */
function loadSavedIds(): Set<string> {
  const key = getStorageKey();
  if (!key) return new Set();
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) return new Set(arr);
    }
  } catch {
    /* ignore */
  }
  return new Set();
}

/** Write saved IDs to localStorage */
function persistSavedIds(ids: Set<string>) {
  const key = getStorageKey();
  if (!key) return;
  try {
    localStorage.setItem(key, JSON.stringify(Array.from(ids)));
  } catch {
    /* ignore */
  }
}

/** Save algorithm IDs to the agency record in the database */
async function syncToDatabase(ids: Set<string>) {
  try {
    const raw = localStorage.getItem("agency_session");
    if (!raw) return;
    const session = JSON.parse(raw);
    if (!session.agency_id) return;

    await fetch("/api/agency/saved-algorithms", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        agency_id: session.agency_id,
        algorithm_ids: Array.from(ids),
      }),
    });
  } catch {
    /* ignore — localStorage is the primary store, DB is backup */
  }
}

export function SavedAlgorithmsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [savedIds, setSavedIds] = useState<Set<string>>(() => new Set());
  const [allAlgorithms, setAllAlgorithms] = useState<Algorithm[]>([]);
  const initialLoadDone = useRef(false);

  // On mount: load saved IDs from localStorage, then try DB
  useEffect(() => {
    // Load from localStorage first (instant)
    const localIds = loadSavedIds();

    // Also try to load from DB
    const raw = localStorage.getItem("agency_session");
    if (raw) {
      try {
        const session = JSON.parse(raw);
        if (session.agency_id) {
          fetch(`/api/agency/saved-algorithms?agency_id=${session.agency_id}`)
            .then((r) => r.json())
            .then((data) => {
              if (data.algorithm_ids && Array.isArray(data.algorithm_ids)) {
                const dbIds = new Set<string>(data.algorithm_ids);
                // Merge: use whichever has more data (prefer local if non-empty, otherwise DB)
                const merged = localIds.size > 0 ? localIds : dbIds;
                setSavedIds(merged);
                persistSavedIds(merged);
                initialLoadDone.current = true;
              }
            })
            .catch(() => {
              // DB fetch failed — use localStorage
              setSavedIds(localIds);
              initialLoadDone.current = true;
            });
          return;
        }
      } catch {
        /* ignore */
      }
    }

    setSavedIds(localIds);
    initialLoadDone.current = true;
  }, []);

  // Fetch algorithms from Supabase on mount
  useEffect(() => {
    fetch("/api/agency/algorithms")
      .then((r) => r.json())
      .then((data) => {
        if (data.algorithms) {
          setAllAlgorithms(data.algorithms);
        }
      })
      .catch((err) => {
        console.error("SavedAlgorithmsContext: Failed to fetch algorithms", err);
      });
  }, []);

  const addAlgorithm = useCallback((id: string) => {
    setSavedIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      persistSavedIds(next);
      syncToDatabase(next);
      return next;
    });
  }, []);

  const removeAlgorithm = useCallback((id: string) => {
    setSavedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      persistSavedIds(next);
      syncToDatabase(next);
      return next;
    });
  }, []);

  const isSaved = useCallback(
    (id: string) => savedIds.has(id),
    [savedIds]
  );

  // Resolve full algorithm objects for sidebar display from fetched data
  const savedAlgorithms: Algorithm[] = Array.from(savedIds)
    .map((id) => allAlgorithms.find((a) => a.id === id))
    .filter((a): a is Algorithm => a !== undefined);

  return (
    <SavedAlgorithmsContext.Provider
      value={{ savedIds, savedAlgorithms, addAlgorithm, removeAlgorithm, isSaved }}
    >
      {children}
    </SavedAlgorithmsContext.Provider>
  );
}

export function useSavedAlgorithms() {
  const ctx = useContext(SavedAlgorithmsContext);
  if (!ctx) {
    throw new Error(
      "useSavedAlgorithms must be used within a SavedAlgorithmsProvider"
    );
  }
  return ctx;
}
