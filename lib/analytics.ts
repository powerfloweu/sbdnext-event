import { track } from "@vercel/analytics";

type EventProps = Record<string, string | number | boolean>;

// Thin wrapper so a tracking call never breaks the registration flow (e.g.
// analytics blocked by an ad blocker, or Vercel Analytics not enabled yet),
// and so every event name used across the funnel lives in one place.
// Never pass personal data (name, e-mail, address) here — only step/locale/
// reason-shaped metadata.
export function trackFunnelEvent(name: string, props?: EventProps): void {
  try {
    track(name, props);
  } catch {
    // ignore — analytics is best-effort
  }
}
