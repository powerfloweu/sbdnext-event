"use client";

import { useFormStatus } from "react-dom";

import { Button, type buttonVariants } from "@/components/ui/button";
import type { VariantProps } from "class-variance-authority";

// Plain <form action={serverAction}> gives zero visual feedback while the
// round-trip is in flight (D, 2026-10-30: "Teszt mód indítása" and "Fizetés
// szimulálása" looked unresponsive for several seconds) — useFormStatus only
// works inside the form it submits, so this has to be its own client
// component rather than a prop on the server-rendered form.
interface SubmitButtonProps extends VariantProps<typeof buttonVariants> {
  pendingLabel: string;
  children: React.ReactNode;
  confirmMessage?: string;
  className?: string;
}

export function SubmitButton({ pendingLabel, children, confirmMessage, variant, size, className }: SubmitButtonProps) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      variant={variant}
      size={size}
      className={className}
      disabled={pending}
      onClick={(e) => {
        if (confirmMessage && !window.confirm(confirmMessage)) {
          e.preventDefault();
        }
      }}
    >
      {pending ? pendingLabel : children}
    </Button>
  );
}
