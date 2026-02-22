"use client";

import { createContext, useContext, useState, useCallback, useEffect } from "react";
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

export function SavedAlgorithmsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [savedIds, setSavedIds] = useState<Set<string>>(() => new Set());
  const [allAlgorithms, setAllAlgorithms] = useState<Algorithm[]>([]);

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
      return next;
    });
  }, []);

  const removeAlgorithm = useCallback((id: string) => {
    setSavedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
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
