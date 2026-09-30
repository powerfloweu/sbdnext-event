import { cn } from "@/lib/utils";

interface PhaseBannerProps {
  label: string;
  tone?: "open" | "neutral" | "closed";
  className?: string;
}

const dotClass: Record<NonNullable<PhaseBannerProps["tone"]>, string> = {
  open: "bg-success",
  neutral: "bg-muted-foreground",
  closed: "bg-destructive",
};

export function PhaseBanner({ label, tone = "neutral", className }: PhaseBannerProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1.5 text-sm font-medium text-foreground",
        className
      )}
    >
      <span className={cn("size-2 rounded-full", dotClass[tone])} aria-hidden="true" />
      {label}
    </div>
  );
}
