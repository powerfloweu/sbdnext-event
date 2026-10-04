import * as React from "react";

import { cn } from "@/lib/utils";

function Input({
  className,
  type,
  "aria-invalid": ariaInvalid,
  ...props
}: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      aria-invalid={ariaInvalid}
      className={cn(
        "flex h-12 w-full min-w-0 rounded-lg border border-input bg-card px-3.5 py-1 text-base text-foreground placeholder:text-muted-foreground outline-none transition-colors md:text-sm",
        "focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40",
        "aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/25",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}

export { Input };
