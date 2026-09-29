import { Quote } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

// Real, permission-cleared feedback from SBD Next 1 (organiser's post-event
// feedback form, "allowQuote" = explicit consent to quote publicly).
// Hungarian only — a translated paraphrase would no longer be their actual
// words, so this block is skipped entirely on the English page.
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
];

export function Testimonials() {
  return (
    <div className="flex flex-col gap-3">
      <span className="eyebrow flex items-center gap-1.5">
        <Quote className="size-3.5" aria-hidden="true" />
        Ezt mondták az SBD Next 1 versenyzői
      </span>
      <div className="grid gap-3 sm:grid-cols-2">
        {QUOTES.map((q) => (
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
    </div>
  );
}
