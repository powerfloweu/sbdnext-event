import type { ComponentType, ReactNode } from "react";

interface StatProps {
  label: string;
  value: string;
  icon?: ComponentType<{ className?: string }>;
}

export function Stat({ label, value, icon: Icon }: StatProps) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-border bg-card/80 px-3 py-2 text-sm text-foreground">
      {Icon && <Icon className="size-4 shrink-0 text-primary" aria-hidden="true" />}
      <span>{value}</span>
      <span className="sr-only">{label}</span>
    </div>
  );
}

export function FactCard({ eyebrow, value }: { eyebrow: string; value: ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="eyebrow mb-2 block">{eyebrow}</div>
      <div className="text-base font-semibold leading-snug text-foreground">{value}</div>
    </div>
  );
}
