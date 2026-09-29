import * as React from "react";

import { cn } from "@/lib/utils";

// The bold "this has no details yet" treatment: a strong red glow radiating
// from one corner, fading into the card background — same visual language
// as FogGlow (the page-wide ambient version) but concentrated and much more
// visible, reserved for placeholder content during the pre-registration
// teaser phase. Once a phase reveals real content, callers just render a
// plain Card there instead — the fog only ever covers what isn't real yet.
export function FogCard({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="fog-card"
      className={cn("relative overflow-hidden rounded-xl border border-primary/30 text-card-foreground", className)}
      style={{
        background:
          "radial-gradient(140% 140% at 15% 0%, color-mix(in oklch, var(--primary) 55%, transparent), transparent 65%), var(--card)",
      }}
      {...props}
    />
  );
}
