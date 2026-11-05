"use client";

import { useEffect } from "react";

import { trackFunnelEvent } from "@/lib/analytics";

type EventProps = Record<string, string | number | boolean>;

// Fires one funnel event when a server-rendered page (e.g. the "köszönjük"/
// "thank you" or "megszakítva"/cancelled page) mounts. Skipped whenever the
// page was reached from admin test mode (test=1 on the URL — see
// registration-wizard.tsx), so test runs never pollute the real funnel.
export function FunnelPageView({
  event,
  props,
  isTest,
}: {
  event: string;
  props?: EventProps;
  isTest?: boolean;
}) {
  useEffect(() => {
    if (isTest) return;
    trackFunnelEvent(event, props);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
