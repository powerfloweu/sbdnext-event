"use client";

import { Button } from "@/components/ui/button";

interface StickyMobileCtaProps {
  label: string;
  sublabel: string;
  href: string;
}

export function StickyMobileCta({ label, sublabel, href }: StickyMobileCtaProps) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 px-4 py-3 backdrop-blur lg:hidden">
      <div className="flex items-center gap-3">
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-sm font-semibold text-foreground">{label}</span>
          <span className="truncate text-xs text-muted-foreground">{sublabel}</span>
        </div>
        <Button asChild size="md" className="shrink-0">
          <a href={href}>Nevezek</a>
        </Button>
      </div>
    </div>
  );
}
