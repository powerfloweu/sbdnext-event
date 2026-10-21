import { EVENT } from "@/config/event";

export type Phase = "announced" | "early-access" | "registration" | "closed" | "live" | "post";

function firstDayStart(): Date {
  const first = EVENT.days[0];
  return new Date(`${first.date}T${first.start}:00+01:00`);
}

function lastConfirmedDayEnd(): Date {
  const confirmed = EVENT.days.filter((d) => d.confirmed);
  const last = confirmed[confirmed.length - 1] ?? EVENT.days[0];
  return new Date(`${last.date}T${last.end}:00+01:00`);
}

/**
 * Every phase-dependent element in the UI should read from this instead of
 * calling `new Date()` inline. See docs/UI_UX_ROBUSTNESS_PLAN.md section 3.
 *
 * - announced:    before early access opens (marketing, October)
 * - early-access: 1h window before the public opening, for newsletter
 *                  subscribers only (see app/api/notify/check and
 *                  components/forms/early-access-gate.tsx)
 * - registration: registration window is open to everyone (Nov–Dec)
 * - closed:       registration closed, before the event (Jan: volunteers, groups)
 * - live:         during a confirmed event day
 * - post:         after the last confirmed event day
 *
 * `PHASE_OVERRIDE` (server-only env var) lets a preview deployment force a
 * phase for review — e.g. set it to "registration" to see the wizard live.
 */
export function getPhase(now: Date = new Date()): Phase {
  const override = process.env.PHASE_OVERRIDE as Phase | undefined;
  if (
    override &&
    ["announced", "early-access", "registration", "closed", "live", "post"].includes(override)
  ) {
    return override;
  }

  const earlyAccessOpensAt = new Date(EVENT.registration.earlyAccessOpensAt);
  const opensAt = new Date(EVENT.registration.opensAt);
  const closesAt = new Date(EVENT.registration.closesAt);
  const firstStart = firstDayStart();
  const lastEnd = lastConfirmedDayEnd();

  if (now < earlyAccessOpensAt) return "announced";
  if (now < opensAt) return "early-access";
  if (now < closesAt) return "registration";
  if (now < firstStart) return "closed";
  if (now <= lastEnd) return "live";
  return "post";
}

export function volunteersOpen(now: Date = new Date()): boolean {
  const opensAt = new Date(EVENT.volunteers.opensAt);
  const closesAt = new Date(EVENT.volunteers.closesAt);
  return now >= opensAt && now < closesAt;
}

export function isCapacityFull(used: number): boolean {
  return used >= EVENT.registration.capacity;
}
