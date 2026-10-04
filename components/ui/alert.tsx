import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const alertVariants = cva(
  "flex items-start gap-3 rounded-lg border p-4 text-sm",
  {
    variants: {
      variant: {
        default: "border-border bg-card text-foreground",
        destructive: "border-destructive/40 bg-destructive/10 text-destructive-foreground [&_svg]:text-destructive",
        success: "border-success/40 bg-success/10 text-foreground [&_svg]:text-success",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

function Alert({
  className,
  variant,
  role = "status",
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
  return (
    <div
      data-slot="alert"
      role={variant === "destructive" ? "alert" : role}
      className={cn(alertVariants({ variant, className }))}
      {...props}
    />
  );
}

export { Alert };
