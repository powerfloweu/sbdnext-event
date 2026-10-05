import * as React from "react";

import { cn } from "@/lib/utils";

function Progress({
  value,
  max = 100,
  className,
  ...props
}: React.ComponentProps<"div"> & { value: number; max?: number }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      data-slot="progress"
      className={cn("h-2 w-full overflow-hidden rounded-full bg-accent", className)}
      {...props}
    >
      <div
        className="h-full rounded-full bg-primary transition-all"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export { Progress };
