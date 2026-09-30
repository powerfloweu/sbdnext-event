export function formatHUF(amount: number): string {
  return new Intl.NumberFormat("hu-HU").format(amount);
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
