"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface NewsletterFeedbackFormProps {
  email: string;
}

export function NewsletterFeedbackForm({ email }: NewsletterFeedbackFormProps) {
  const [feedback, setFeedback] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "done" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!feedback.trim()) return;

    setStatus("submitting");
    try {
      const res = await fetch("/api/notify/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, feedback }),
      });
      setStatus(res.ok ? "done" : "error");
    } catch {
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-success/40 bg-success/10 p-4 text-sm text-foreground">
        <CheckCircle2 className="size-5 shrink-0 text-success" aria-hidden="true" />
        Köszönjük a visszajelzést!
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <label htmlFor="feedback" className="text-sm font-semibold text-foreground">
        Mondd el, hogy lehet a mostani verseny még jobb, mint az előző?
      </label>
      <Textarea
        id="feedback"
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
        rows={4}
        placeholder="Írd le pár mondatban… (opcionális)"
      />
      <Button type="submit" disabled={status === "submitting" || !feedback.trim()} className="self-start">
        {status === "submitting" ? "Küldés…" : "Elküldöm"}
      </Button>
      {status === "error" && (
        <p className="text-xs text-destructive">
          Hiba történt a küldés közben, próbáld újra, vagy írj a powerlifting@sbdnext.hu címre.
        </p>
      )}
    </form>
  );
}
