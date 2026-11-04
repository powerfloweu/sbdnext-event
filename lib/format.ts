export function formatHUF(amount: number): string {
  return new Intl.NumberFormat("hu-HU").format(amount);
}

export function formatEUR(amount: number): string {
  return new Intl.NumberFormat("en-IE").format(amount);
}

export function formatKg(value: number): string {
  return `${new Intl.NumberFormat("hu-HU", { maximumFractionDigits: 1 }).format(value)} kg`;
}

export type TimeLeft = { days: number; hours: number; minutes: number; seconds: number };

export function getTimeLeft(target: Date, now: Date = new Date()): TimeLeft | null {
  const diff = target.getTime() - now.getTime();
  if (diff <= 0) return null;
  const totalSeconds = Math.floor(diff / 1000);
  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };
}

export function pad2(n: number): string {
  return n.toString().padStart(2, "0");
}

export function formatDate(iso: string, locale: "hu" | "en" = "hu"): string {
  return new Intl.DateTimeFormat(locale === "en" ? "en-GB" : "hu-HU", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(iso));
}

// Renders a confirmed multi-day range as "2027. február 13–14." (hu) or
// "13–14 February 2027" (en) instead of repeating the year and month per
// day.
export function formatDateRange(days: readonly { date: string }[], locale: "hu" | "en" = "hu"): string {
  if (days.length === 1) return formatDate(days[0].date, locale);
  const first = new Date(days[0].date);
  const last = new Date(days[days.length - 1].date);
  const sameMonth = first.getFullYear() === last.getFullYear() && first.getMonth() === last.getMonth();
  if (!sameMonth) return days.map((d) => formatDate(d.date, locale)).join(" – ");
  if (locale === "en") {
    const monthYear = new Intl.DateTimeFormat("en-GB", { year: "numeric", month: "long" }).format(first);
    return `${first.getDate()}–${last.getDate()} ${monthYear}`;
  }
  const monthLabel = new Intl.DateTimeFormat("hu-HU", { year: "numeric", month: "long" }).format(first);
  return `${monthLabel} ${first.getDate()}–${last.getDate()}.`;
}
