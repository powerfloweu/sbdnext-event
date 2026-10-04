"use client";

import { useState } from "react";
import { Mail, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getSupabaseBrowser } from "@/lib/supabase/browser";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    try {
      const supabase = getSupabaseBrowser();
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim().toLowerCase(),
        options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=/admin` },
      });
      setStatus(error ? "error" : "sent");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col items-center justify-center gap-6 px-4 text-center">
      <Mail className="size-10 text-primary" aria-hidden="true" />
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-bold">SBD Next — Admin</h1>
        <p className="text-sm text-muted-foreground">Belépéshez küldünk egy egyszer használatos linket e-mailben.</p>
      </div>

      {status === "sent" ? (
        <Card className="w-full border-success/40 bg-success/10">
          <CardContent className="flex items-center gap-2 p-4 text-sm">
            <CheckCircle2 className="size-5 shrink-0 text-success" aria-hidden="true" />
            Elküldtük a linket a(z) {email} címre — nézd meg a postaládád.
          </CardContent>
        </Card>
      ) : (
        <form onSubmit={handleSubmit} className="flex w-full flex-col gap-3">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="e-mail cím"
            className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground"
          />
          <Button type="submit" disabled={status === "sending"}>
            {status === "sending" ? "Küldés…" : "Belépési link küldése"}
          </Button>
          {status === "error" && (
            <p className="text-xs text-destructive">Hiba történt — próbáld újra.</p>
          )}
        </form>
      )}
    </div>
  );
}
