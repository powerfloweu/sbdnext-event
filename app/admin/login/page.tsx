"use client";

import { useState } from "react";
import { Mail, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getSupabaseBrowser } from "@/lib/supabase/browser";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [googleStatus, setGoogleStatus] = useState<"idle" | "redirecting" | "error">("idle");

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

  async function handleGoogleSignIn() {
    setGoogleStatus("redirecting");
    try {
      const supabase = getSupabaseBrowser();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/auth/callback?next=/admin` },
      });
      if (error) setGoogleStatus("error");
      // On success the browser navigates away to Google, so no further state change needed here.
    } catch {
      setGoogleStatus("error");
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col items-center justify-center gap-6 px-4 text-center">
      <Mail className="size-10 text-primary" aria-hidden="true" />
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-bold">SBD Next — Admin</h1>
        <p className="text-sm text-muted-foreground">Jelentkezz be Google-fiókkal, vagy kérj egyszer használatos linket.</p>
      </div>

      <Button type="button" variant="secondary" className="w-full" onClick={handleGoogleSignIn} disabled={googleStatus === "redirecting"}>
        {googleStatus === "redirecting" ? "Átirányítás…" : "Bejelentkezés Google-fiókkal"}
      </Button>
      {googleStatus === "error" && (
        <p className="-mt-3 text-xs text-destructive">Hiba történt a Google bejelentkezésnél — próbáld újra.</p>
      )}

      <div className="flex w-full items-center gap-3 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        vagy
        <span className="h-px flex-1 bg-border" />
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
          <Button type="submit" variant="ghost" disabled={status === "sending"}>
            {status === "sending" ? "Küldés…" : "Belépési link küldése e-mailben"}
          </Button>
          {status === "error" && (
            <p className="text-xs text-destructive">Hiba történt — próbáld újra.</p>
          )}
        </form>
      )}
    </div>
  );
}
