"use client";

import { createContext, useContext, useState, useCallback } from "react";
import type { Algorithm } from "@/lib/types";
import { mockAgencySavedAlgorithmIds, getAlgorithmById } from "@/lib/mock-data";

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
  const [savedIds, setSavedIds] = useState<Set<string>>(
    () => new Set(mockAgencySavedAlgorithmIds)
  );

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

  // Resolve full algorithm objects for sidebar display
  const savedAlgorithms: Algorithm[] = Array.from(savedIds)
    .map((id) => getAlgorithmById(id))
    .filter((a): a is Algorithm => a !== null);

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
