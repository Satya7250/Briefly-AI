"use client";

import { useState, useEffect } from "react";

export interface IntegrationStatus {
  gmailConnected: boolean;
  calendarConnected: boolean;
  gmailConnectedAt: Date | null;
  calendarConnectedAt: Date | null;
}

export function useIntegrationStatus() {
  const [status, setStatus] = useState<IntegrationStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch("/api/integrations/status");
        if (res.ok) {
          const result = await res.json();
          setStatus({
            ...result.data,
            gmailConnectedAt: result.data.gmailConnectedAt
              ? new Date(result.data.gmailConnectedAt)
              : null,
            calendarConnectedAt: result.data.calendarConnectedAt
              ? new Date(result.data.calendarConnectedAt)
              : null,
          });
        }
      } catch (err) {
        console.error("Error fetching integration status:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStatus();
  }, []);

  const refreshStatus = async () => {
    try {
      const res = await fetch("/api/integrations/status");
      if (res.ok) {
        const result = await res.json();
        setStatus({
          ...result.data,
          gmailConnectedAt: result.data.gmailConnectedAt
            ? new Date(result.data.gmailConnectedAt)
            : null,
          calendarConnectedAt: result.data.calendarConnectedAt
            ? new Date(result.data.calendarConnectedAt)
            : null,
        });
      }
    } catch (err) {
      console.error("Error refreshing integration status:", err);
    }
  };

  return { status, loading, refreshStatus };
}
