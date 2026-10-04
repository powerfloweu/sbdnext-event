import * as React from "react";

import { cn } from "@/lib/utils";

function Label({
  className,
  required,
  children,
  ...props
}: React.ComponentProps<"label"> & { required?: boolean }) {
  return (
    <label
      data-slot="label"
      className={cn("text-sm font-semibold text-foreground", className)}
      {...props}
    >
      {children}
      {required && (
        <span className="text-primary" aria-hidden="true">
          {" "}
          *
        </span>
      )}
    </label>
  );
}

export { Label };
