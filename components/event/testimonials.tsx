"use client";

import { useEffect, useState } from "react";
import { Quote } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

// Real, permission-cleared feedback from SBD Next 1 (organiser's post-event
// feedback form, "allowQuote" = explicit consent to quote publicly).
// Hungarian only — a translated paraphrase would no longer be their actual
// words, so this block is skipped entirely on the English page.
//
// This is every competitor response in the feedback sheet that granted
// quote consent — not a curated few. A volunteer's (non-competitor)
// response and one respondent's illegible one-word answer were left out;
// nothing here is invented.
const QUOTES = [
  {
    quote: "Átjárta a profi hangulat az egész rendezvényt. Igazi nagy ligás élmény volt.",
    name: "Kovács István",
    instagram: "istvn.kvcs",
  },
  {
    quote:
      "…fantasztikus volt a közösségi élmény, a befogadó közeg, a hangulat és az egész vibe — ez tetszett a legjobban.",
    name: "Noémi",
  },
  {
    quote: "Remek szervezés, hangulat, zene, atmoszféra, időrend. 10/10.",
    name: "Tóth Enikő",
    instagram: "encidus_power",
  },
  {
    quote: "Csodálatos élmény volt. Profi munka minden téren!",
    name: "Szarka Zoltán",
    instagram: "golyolift",
  },
  {
    quote: "A bemelegítésnek fenntartott terület igazán felszerelt volt.",
    name: "Homor Boglárka",
    instagram: "homorbogii",
  },
  {
    quote: "A verseny hangulata, megszervezése és a szervezők / segítők odaadása.",
    name: "Tulipán Lea",
  },
  {
    quote: "A bemelegítő nagyon jó volt! A hangulat és egymás bíztatása! Bírók szigorúsága!",
    name: "Erdei Mihály",
  },
  {
    quote:
      "Egész feeling, színek. Első nagy versenyem volt, minden tipp-topp. Élvezetes volt nagyon. Legközelebb is örömmel mennék!",
    name: "Galambosi Máté",
  },
  {
    quote: "Maga a hangulat tetszett, a tér is jól lett kihasználva, a bemondó is jó volt.",
    name: "Meow",
  },
  {
    quote:
      "…alapvetően jól sikerült a verseny, megalapozta a hangulatot, és kicsit az IPF-en kívüli profi versenyek világát hozta meg.",
    name: "Kőszegi Gábor",
    instagram: "kszggbr",
  },
];

const PAGE_SIZE = 4;
const PAGE_COUNT = Math.ceil(QUOTES.length / PAGE_SIZE);
const INTERVAL_MS = 15000;

export function Testimonials() {
  const [page, setPage] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setPage((p) => (p + 1) % PAGE_COUNT), INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  const visible = QUOTES.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  return (
    <div className="flex flex-col gap-3">
      <span className="eyebrow flex items-center gap-1.5">
        <Quote className="size-3.5" aria-hidden="true" />
        Ezt mondták az SBD Next 1 versenyzői
      </span>
      <div className="grid gap-3 sm:grid-cols-2">
        {visible.map((q) => (
          <Card key={q.name}>
            <CardContent className="flex h-full flex-col justify-between gap-3 p-5">
              <p className="text-sm text-foreground/90">&bdquo;{q.quote}&rdquo;</p>
              <span className="text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">{q.name}</span>
                {q.instagram ? ` · @${q.instagram}` : ""}
              </span>
            </CardContent>
          </Card>
        ))}
      </div>
      {PAGE_COUNT > 1 && (
        <div className="flex justify-center gap-1.5">
          {Array.from({ length: PAGE_COUNT }).map((_, idx) => (
            <button
              key={idx}
              type="button"
              aria-label={`Vélemények, ${idx + 1}. oldal`}
              aria-current={idx === page}
              onClick={() => setPage(idx)}
              className={`size-2 rounded-full transition-colors ${
                idx === page ? "bg-primary" : "bg-border hover:bg-muted-foreground"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
