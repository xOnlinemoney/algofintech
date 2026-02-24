"use client";

import { useState, useEffect } from "react";

interface AgencyBranding {
  agencyName: string;
  isLoading: boolean;
}

/**
 * Hook to get the white-label agency name for client-facing pages.
 * Reads from the client_session in localStorage which is set during
 * client login/signup from the agencies table in Supabase.
 *
 * Falls back to empty string so no "AlgoFinTech" branding leaks through.
 */
export function useAgencyBranding(): AgencyBranding {
  const [agencyName, setAgencyName] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("client_session");
      if (stored) {
        const session = JSON.parse(stored);
        if (session.agency_name) {
          setAgencyName(session.agency_name);
        }
      }
    } catch {
      /* ignore */
    }
    setIsLoading(false);
  }, []);

  return { agencyName, isLoading };
}
