"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface NewsletterFeedbackFormProps {
  email: string;
  onDone: () => void;
}

export function NewsletterFeedbackForm({ email, onDone }: NewsletterFeedbackFormProps) {
  const [feedback, setFeedback] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");

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
      if (res.ok) {
        onDone();
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
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
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={status === "submitting" || !feedback.trim()}>
          {status === "submitting" ? "Küldés…" : "Elküldöm"}
        </Button>
        <Button type="button" variant="ghost" onClick={onDone} disabled={status === "submitting"}>
          Kihagyom
        </Button>
      </div>
      {status === "error" && (
        <p className="text-xs text-destructive">
          Hiba történt a küldés közben, próbáld újra, vagy írj a powerlifting@sbdnext.hu címre.
        </p>
      )}
    </form>
  );
}
