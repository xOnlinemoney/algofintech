"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, XCircle } from "lucide-react";

export default function AgencyStatusBanner() {
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("agency_session");
      if (!stored) return;
      const session = JSON.parse(stored);
      const agencyId = session.agency_id;
      if (!agencyId) return;

      fetch(`/api/agency/status?agency_id=${agencyId}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.status && data.status !== "active") {
            setStatus(data.status);
          }
        })
        .catch(() => {});
    } catch {
      /* ignore */
    }
  }, []);

  if (!status) return null;

  if (status === "suspended") {
    return (
      <div className="w-full bg-red-500/10 border-b border-red-500/30 px-6 py-3 flex items-center gap-3 shrink-0">
        <XCircle className="w-5 h-5 text-red-500 shrink-0" />
        <div className="flex-1">
          <span className="text-sm font-semibold text-red-400">Your agency account has been suspended.</span>
          <span className="text-sm text-red-300/80 ml-1">
            Reach out to support:{" "}
            <a href="mailto:support@algofintech.com" className="underline hover:text-red-200 font-medium">
              support@algofintech.com
            </a>
          </span>
        </div>
      </div>
    );
  }

  if (status === "paused") {
    return (
      <div className="w-full bg-amber-500/10 border-b border-amber-500/30 px-6 py-3 flex items-center gap-3 shrink-0">
        <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
        <div className="flex-1">
          <span className="text-sm font-semibold text-amber-400">Your agency account has been paused.</span>
          <span className="text-sm text-amber-300/80 ml-1">
            Please reach out to support:{" "}
            <a href="mailto:support@algofintech.com" className="underline hover:text-amber-200 font-medium">
              support@algofintech.com
            </a>
          </span>
        </div>
      </div>
    );
  }

  return null;
}
