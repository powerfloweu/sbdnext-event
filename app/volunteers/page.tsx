"use client";

import Link from "next/link";
import { ArrowLeft, HandHeart } from "lucide-react";

import { VolunteerForm } from "@/components/volunteer-form";

export default function VolunteersPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-4xl px-4 py-10 space-y-6">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-300 hover:text-red-300"
          >
            <ArrowLeft className="h-4 w-4" /> Vissza a főoldalra
          </Link>
          <div className="flex items-center gap-2 rounded-full border border-red-900/60 bg-red-950/40 px-3 py-1 text-[11px] text-red-200">
            <HandHeart className="h-3.5 w-3.5" />
            Önkéntes jelentkezés
          </div>
        </div>

        <div className="rounded-3xl border border-red-900/60 bg-neutral-950/70 p-6 shadow-[0_0_40px_rgba(248,113,113,0.15)] sm:p-8">
          <div className="space-y-2 pb-4">
            <p className="text-sm text-neutral-200">
              Köszönjük, hogy segítenél a verseny lebonyolításában! Válaszd ki, melyik napokon tudsz jönni, milyen pozícióban dolgoznál, és add meg a póló adataidat.
            </p>
            <p className="text-xs text-neutral-400">
              A jelentkezéseket visszaigazoljuk, és e-mailben küldjük a további részleteket.
            </p>
          </div>

          <VolunteerForm />
        </div>
      </div>
    </main>
  );
}
