"use client";

import { Suspense, useEffect, useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type WeightFormState = {
  name: string;
  email: string;
  weight: string;
  submitting: boolean;
  done: boolean;
  error: string | null;
};

const WEBHOOK_URL = process.env.NEXT_PUBLIC_WEIGHT_WEBHOOK || "";

function WeightFormInner() {
  const searchParams = useSearchParams();

  const prefillName = searchParams.get("name") ?? "";
  const prefillEmail = searchParams.get("email") ?? "";
  const isNamePrefilled = Boolean(prefillName);
  const isEmailPrefilled = Boolean(prefillEmail);

  const [state, setState] = useState<WeightFormState>({
    name: prefillName,
    email: prefillEmail,
    weight: "",
    submitting: false,
    done: false,
    error: null,
  });

  useEffect(() => {
    setState((s) => {
      // csak akkor írjuk felül, ha még üres és van prefill
      const next = { ...s };
      if (!next.name && prefillName) {
        next.name = prefillName;
      }
      if (!next.email && prefillEmail) {
        next.email = prefillEmail;
      }
      return next;
    });
  }, [prefillName, prefillEmail]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    // Név
    if (!state.name.trim()) {
      setState((s) => ({ ...s, error: "Kérlek add meg a neved." }));
      return;
    }

    // E-mail
    if (!state.email.trim()) {
      setState((s) => ({ ...s, error: "Kérlek add meg az e-mail címed." }));
      return;
    }
    if (!/.+@.+\..+/.test(state.email)) {
      setState((s) => ({
        ...s,
        error: "Kérlek valós e-mail címet adj meg.",
      }));
      return;
    }

    // Testsúly
    const weightRaw = state.weight.trim().replace(",", ".");
    if (!weightRaw) {
      setState((s) => ({
        ...s,
        error: "Kérlek add meg a testsúlyod (kg).",
      }));
      return;
    }
    const weightNum = Number(weightRaw);
    if (Number.isNaN(weightNum) || weightNum < 30 || weightNum > 250) {
      setState((s) => ({
        ...s,
        error: "A testsúlynak 30 és 250 kg közé kell esnie.",
      }));
      return;
    }

    setState((s) => ({ ...s, submitting: true, error: null }));

    try {
      if (WEBHOOK_URL) {
        const payload = {
          timestamp: new Date().toISOString(),
          name: state.name.trim(),
          email: state.email.trim(),
          weight: weightNum,
          page: "/weight",
        };

        await fetch(WEBHOOK_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }).catch(() => {
          // ha elszáll a webhook, ettől még a usernek sikert jelezünk
        });
      }

      setState((s) => ({ ...s, done: true }));
    } catch {
      setState((s) => ({
        ...s,
        error:
          "A beküldés nem sikerült. Próbáld újra, vagy írj nekünk e-mailt.",
      }));
    } finally {
      setState((s) => ({ ...s, submitting: false }));
    }
  }

  if (state.done) {
    return (
      <Card className="rounded-2xl border border-green-600/60 bg-black/70">
        <CardContent className="p-6 text-center text-sm text-green-100">
          <p className="mb-2 font-semibold">
            Köszönjük, a testsúlyod rögzítettük.
          </p>
          <p className="text-xs text-neutral-300">
            Amennyiben esetleg még nem kaptál e-mailt arról, hogy a fizetés is rendben van, akkor most megnyugodhatsz – a nevezésed végleges. Ha bármi gond adódna, felkeresünk.
          </p>
          <p className="mt-3 text-[11px] text-neutral-400">
            Ha elírást vettél észre, írj nekünk a{" "}
            <a
              href="mailto:powerlifting@sbdnext.hu"
              className="text-red-400 underline hover:text-red-300"
            >
              powerlifting@sbdnext.hu
            </a>{" "}
            címen.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl border border-neutral-800 bg-black/80 shadow-[0_0_45px_rgba(0,0,0,0.9)]">
      <CardContent className="space-y-4 p-6 text-sm text-neutral-100">
        <div>
          <h1 className="text-lg font-semibold text-red-400">
            Tervezett testsúly megadása
          </h1>
          <p className="mt-1 text-xs text-neutral-300">
            A beosztás miatt fontos, hogy lásd, milyen testsúlyra készülsz a
            verseny napján. Kérlek, nagyjából ±3 kg pontossággal add meg.
          </p>
        </div>

        {state.error && (
          <div className="text-xs text-red-400">{state.error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3" noValidate>
          <div>
            <label className="text-xs font-semibold text-red-400">
              Név <span className="text-red-500">*</span>
            </label>
            <Input
              className="mt-1"
              value={state.name}
              onChange={(e) =>
                setState((s) => ({ ...s, name: e.target.value }))
              }
              placeholder="Vezetéknév Keresztnév"
              required
              readOnly={isNamePrefilled}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-red-400">
              E-mail <span className="text-red-500">*</span>
            </label>
            <Input
              className="mt-1"
              type="email"
              value={state.email}
              onChange={(e) =>
                setState((s) => ({ ...s, email: e.target.value }))
              }
              placeholder="nev@email.hu"
              required
              readOnly={isEmailPrefilled}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-red-400">
              Tervezett testsúly (kg) <span className="text-red-500">*</span>
            </label>
            <Input
              className="mt-1"
              inputMode="numeric"
              value={state.weight}
              onChange={(e) =>
                setState((s) => ({ ...s, weight: e.target.value }))
              }
              placeholder="pl. 83"
              required
            />
            <p className="mt-1 text-[11px] text-neutral-400">
              A versenyen tervezett testsúlyod, nagyjából ±3 kg pontossággal.
            </p>
          </div>

          <Button
            type="submit"
            disabled={state.submitting}
            className="mt-2 w-full rounded-3xl bg-gradient-to-r from-red-700 via-red-500 to-red-400 px-6 py-3 text-sm font-semibold shadow-[0_0_40px_rgba(248,113,113,0.9)] hover:from-red-600 hover:via-red-500 hover:to-red-300"
          >
            {state.submitting ? "Beküldés…" : "Testsúly beküldése"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default function WeightPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-neutral-950 to-black text-neutral-50">
      <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-10">
        <Suspense
          fallback={
            <div className="rounded-2xl border border-neutral-800 bg-black/80 p-6 text-center text-sm text-neutral-200">
              Betöltés…
            </div>
          }
        >
          <WeightFormInner />
        </Suspense>
      </main>
    </div>
  );
}