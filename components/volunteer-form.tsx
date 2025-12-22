"use client";

import { useState } from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type VolunteerFormState = {
  name: string;
  day14: boolean;
  day15: boolean;
  bothDays: boolean;
  shirtCut: string;
  shirtSize: string;
  position: string;
  submitting: boolean;
  done: boolean;
  error: string | null;
  honeypot: string;
};

export function VolunteerForm() {
  const WEBHOOK_URL = process.env.NEXT_PUBLIC_VOLUNTEER_WEBHOOK || "";
  const MAKE_WEBHOOK_URL = process.env.NEXT_PUBLIC_VOLUNTEER_MAKE_WEBHOOK || "";
  const WEBHOOKS = [WEBHOOK_URL, MAKE_WEBHOOK_URL].filter(Boolean);

  const [state, setState] = useState<VolunteerFormState>({
    name: "",
    day14: false,
    day15: false,
    bothDays: false,
    shirtCut: "",
    shirtSize: "",
    position: "",
    submitting: false,
    done: false,
    error: null,
    honeypot: "",
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (state.honeypot) return;

    const name = state.name.trim();
    if (!name) {
      setState((s) => ({ ...s, error: "Kérlek add meg a neved." }));
      return;
    }

    const selectedDays = [state.day14, state.day15, state.bothDays].filter(Boolean).length;
    if (selectedDays !== 1) {
      setState((s) => ({
        ...s,
        error: "Válaszd ki pontosan egy opciót: 02.14, 02.15 vagy mindkét nap.",
      }));
      return;
    }

    if (!state.position) {
      setState((s) => ({ ...s, error: "Válaszd ki a preferált pozíciót." }));
      return;
    }

    if (!state.shirtCut) {
      setState((s) => ({ ...s, error: "Válaszd ki a póló fazonját." }));
      return;
    }

    if (!state.shirtSize) {
      setState((s) => ({ ...s, error: "Válaszd ki a pólóméretet." }));
      return;
    }

    setState((s) => ({ ...s, submitting: true, error: null }));

    const days = [] as string[];
    if (state.bothDays) {
      days.push("2026-02-14", "2026-02-15");
    } else {
      if (state.day14) days.push("2026-02-14");
      if (state.day15) days.push("2026-02-15");
    }

    const payload = {
      timestamp: new Date().toISOString(),
      name,
      days,
      position: state.position,
      shirtCut: state.shirtCut,
      shirtSize: state.shirtSize,
    };

    try {
      if (WEBHOOKS.length > 0) {
        const results = await Promise.allSettled(
          WEBHOOKS.map((url) =>
            fetch(url, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            })
          )
        );

        const anySuccess = results.some((r) => r.status === "fulfilled");
        if (!anySuccess) {
          setState((s) => ({
            ...s,
            error: "A beküldés nem sikerült, próbáld újra.",
          }));
          return;
        }
      }

      setState((s) => ({ ...s, done: true }));
    } catch {
      setState((s) => ({
        ...s,
        error: "A beküldés nem sikerült, próbáld újra.",
      }));
    } finally {
      setState((s) => ({ ...s, submitting: false }));
    }
  };

  if (state.done) {
    return (
      <div className="rounded-2xl border border-green-600/60 bg-black/70 p-5 text-sm text-green-100">
        <div className="flex items-center gap-2 font-semibold">
          <CheckCircle2 className="h-5 w-5 text-green-400" />
          Köszönjük, rögzítettük az önkéntes jelentkezésed.
        </div>
        <p className="mt-2 text-[12px] text-neutral-300">
          Hamarosan e-mailben keresünk a részletekkel.
        </p>
      </div>
    );
  }

  return (
    <form className="grid gap-4" onSubmit={handleSubmit} noValidate>
      <div className="hidden" aria-hidden="true">
        <label>Ne töltsd ki ezt a mezőt</label>
        <Input
          tabIndex={-1}
          autoComplete="off"
          value={state.honeypot}
          onChange={(e) => setState((s) => ({ ...s, honeypot: e.target.value }))}
          placeholder="Hagyja üresen"
        />
      </div>

      {state.error && (
        <div className="flex items-center gap-2 text-sm text-red-400">
          <AlertCircle className="h-4 w-4" /> {state.error}
        </div>
      )}

      <div>
        <label className="text-sm font-semibold text-red-400">
          Név <span className="text-red-500">*</span>
        </label>
        <Input
          className="border-red-500"
          value={state.name}
          onChange={(e) => setState((s) => ({ ...s, name: e.target.value }))}
          placeholder="Vezetéknév Keresztnév"
          required
        />
      </div>

      <div>
        <label className="text-sm font-semibold text-red-400">
          Melyik napokon tudsz segíteni? <span className="text-red-500">*</span>
        </label>
        <div className="mt-2 grid gap-2 sm:grid-cols-3">
          <label className="flex items-center gap-3 text-sm">
            <Checkbox
              checked={state.day14}
              onCheckedChange={(v: boolean | "indeterminate") => {
                const next = Boolean(v);
                setState((s) => ({ ...s, day14: next, day15: false, bothDays: false }));
              }}
            />
            <span>02.14 (szombat)</span>
          </label>
          <label className="flex items-center gap-3 text-sm">
            <Checkbox
              checked={state.day15}
              onCheckedChange={(v: boolean | "indeterminate") => {
                const next = Boolean(v);
                setState((s) => ({ ...s, day14: false, day15: next, bothDays: false }));
              }}
            />
            <span>02.15 (vasárnap)</span>
          </label>
          <label className="flex items-center gap-3 text-sm">
            <Checkbox
              checked={state.bothDays}
              onCheckedChange={(v: boolean | "indeterminate") => {
                const next = Boolean(v);
                setState((s) => ({ ...s, day14: false, day15: false, bothDays: next }));
              }}
            />
            <span>Mindkét napot tudom vállalni</span>
          </label>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="text-sm font-semibold text-red-400">
            Preferált pozíció <span className="text-red-500">*</span>
          </label>
          <Select
            onValueChange={(v) => setState((s) => ({ ...s, position: v }))}
            value={state.position}
          >
            <SelectTrigger className="border-red-500">
              <SelectValue placeholder="Válassz" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="higiéniai felelős">higiéniai felelős</SelectItem>
              <SelectItem value="terelő">terelő</SelectItem>
              <SelectItem value="karszalag felelős">karszalag felelős</SelectItem>
              <SelectItem value="admin">admin</SelectItem>
              <SelectItem value="biztonsági">biztonsági</SelectItem>
            </SelectContent>
          </Select>
          <p className="mt-1 text-xs text-neutral-400">
            Minden pozícióra várunk jelentkezőt; ha valamelyikre nincs elég ember, a szervezők jelölik ki a beosztást.
          </p>
        </div>

        <div>
          <label className="text-sm font-semibold text-red-400">
            Póló fazon <span className="text-red-500">*</span>
          </label>
          <Select
            onValueChange={(v) => setState((s) => ({ ...s, shirtCut: v }))}
            value={state.shirtCut}
          >
            <SelectTrigger className="border-red-500">
              <SelectValue placeholder="Válassz" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Női">Női</SelectItem>
              <SelectItem value="Férfi">Férfi</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="text-sm font-semibold text-red-400">
            Pólóméret <span className="text-red-500">*</span>
          </label>
          <Select
            onValueChange={(v) => setState((s) => ({ ...s, shirtSize: v }))}
            value={state.shirtSize}
          >
            <SelectTrigger className="border-red-500">
              <SelectValue placeholder="Válassz" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="XS">XS</SelectItem>
              <SelectItem value="S">S</SelectItem>
              <SelectItem value="M">M</SelectItem>
              <SelectItem value="L">L</SelectItem>
              <SelectItem value="XL">XL</SelectItem>
              <SelectItem value="2XL">2XL</SelectItem>
              <SelectItem value="3XL">3XL</SelectItem>
              <SelectItem value="4XL">4XL</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button
        type="submit"
        disabled={state.submitting}
        className="h-12 rounded-full bg-gradient-to-r from-red-700 via-red-500 to-red-400 px-8 text-sm sm:text-base font-extrabold shadow-[0_0_50px_rgba(248,113,113,0.8)] border border-red-200/80 hover:from-red-600 hover:via-red-500 hover:to-red-300 transition-all duration-200"
      >
        {state.submitting ? "Küldés…" : "Önkéntes jelentkezés elküldése"}
      </Button>

      <p className="text-[11px] text-neutral-400">
        A megadott adatokat csak a verseny szervezése kapcsán használjuk fel és megosztjuk a szervezőcsapattal.
      </p>
    </form>
  );
}
