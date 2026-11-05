import { Info } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Section } from "@/components/site/section";
import { EVENT } from "@/config/event";

const FAQ = [
  {
    q: "Kell sportorvosi vagy szövetségi engedély?",
    a: "Nem. Nem kell klubtagság és sportorvosi engedély sem, a verseny szabadidős esemény.",
  },
  {
    q: "Tehetségkutató vagy Versenyzői vagyok?",
    a: "Tehetségkutató: 2025-ben és/vagy 2026-ban nem indultál a MERSZ I. osztályú magyar bajnokságon, illetve IPF nemzetközi (vagy azzal egyenértékű külföldi) versenyen — II. osztályú vagy kisebb versenyen való részvétel nem zár ki. Versenyzői: indultál a MERSZ 2025-ös vagy 2026-os Felnőtt Magyar Bajnokságán, vagy elérted az Open I. osztályú szintet (ill. ennek nemzetközi megfelelőjét).",
  },
  {
    q: "Mi van, ha betelik a létszám?",
    a: "A jelentkezésed várólistára kerül. Ha felszabadul hely, e-mailben keresünk, fizetni csak akkor kell, ha visszaigazoljuk.",
  },
  {
    q: "Milyen felszerelés kötelező?",
    a: "A versenyzői kategóriában kantáros erőemelő mez, hosszú zokni, cipő és póló szükséges. A tehetségkutató kategóriában elegendő a testhez simuló ruházat. Részletek a Szabályok szekcióban.",
  },
  {
    q: "Hogyan fizethetek?",
    a: "Online, Stripe-on keresztül — a nevezés végén átirányítunk a fizetési oldalra.",
  },
  {
    q: "Mi van a nevezési díjban?",
    a: "Media csomag (profi fotók rólad). A póló csak a Nevezés + póló csomagban jár, külön felár ellenében. A póló egyedi, névre szóló. Prémium média csomag is külön vásárolható.",
  },
  {
    q: "Lesz élő közvetítés?",
    a: "Igen, a stream linkek a verseny napján lesznek élesben elérhetők ezen az oldalon.",
  },
];

export function FaqSection() {
  return (
    <Section id="faq" icon={Info} eyebrow="GYIK" title="Gyakori kérdések">
      <Card className="px-2 sm:px-4">
        <Accordion defaultValue="q-0">
          {FAQ.map((item, idx) => (
            <AccordionItem key={item.q} value={`q-${idx}`}>
              <AccordionTrigger value={`q-${idx}`} className="px-2 sm:px-2">
                {item.q}
              </AccordionTrigger>
              <AccordionContent value={`q-${idx}`} className="px-2 sm:px-2">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Card>
      <p className="mt-4 text-xs text-muted-foreground">
        További kérdés esetén írj nekünk:{" "}
        <a href={`mailto:${EVENT.contact.email}`} className="text-primary underline underline-offset-4">
          {EVENT.contact.email}
        </a>
      </p>
    </Section>
  );
}
