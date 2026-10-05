"use client";

import { useEffect, useMemo, useState } from "react";
import { getTimeLeft, pad2, type TimeLeft } from "@/lib/format";

interface CountdownTimerProps {
  target: Date | string;
  className?: string;
  doneLabel?: string;
}

export function CountdownTimer({ target, className, doneLabel }: CountdownTimerProps) {
  const targetDate = useMemo(
    () => (typeof target === "string" ? new Date(target) : target),
    [target]
  );
  // null covers both "not mounted yet" and "countdown reached zero" — the
  // `mounted` flag below tells them apart so the server-rendered markup and
  // the first client render match (no hydration mismatch from a value
  // computed at build/request time).
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Both state updates below run from callbacks handed to browser timer
    // APIs (setTimeout/setInterval), not synchronously in the effect body,
    // so this only ever syncs with an external clock — never fires on
    // render itself.
    function tick() {
      setMounted(true);
      setTimeLeft(getTimeLeft(targetDate));
    }
    const firstTick = window.setTimeout(tick, 0);
    const id = window.setInterval(tick, 1000);
    return () => {
      window.clearTimeout(firstTick);
      window.clearInterval(id);
    };
  }, [targetDate]);

  if (!mounted) {
    return <span className={className}>&nbsp;</span>;
  }

  if (!timeLeft) {
    return <span className={className}>{doneLabel ?? "Elkezdődött!"}</span>;
  }

  return (
    <span className={className}>
      {timeLeft.days > 0 && <span>{timeLeft.days} nap </span>}
      <span>
        {pad2(timeLeft.hours)}:{pad2(timeLeft.minutes)}:{pad2(timeLeft.seconds)}
      </span>
    </span>
  );
}
