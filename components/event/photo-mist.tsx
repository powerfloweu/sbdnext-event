import { Lock } from "lucide-react";

interface PhotoMistProps {
  active: boolean;
  label?: string;
}

export function PhotoMist({ active, label = "Fotók hamarosan" }: PhotoMistProps) {
  if (!active) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-background/55 backdrop-blur-md">
      <span className="flex items-center gap-2 rounded-full border border-border/60 bg-background/80 px-4 py-2 text-xs font-semibold tracking-wide text-foreground/80 uppercase">
        <Lock className="size-3.5" aria-hidden="true" />
        {label}
      </span>
    </div>
  );
}
