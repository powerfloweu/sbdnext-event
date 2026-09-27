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
    q: "Újonc vagy Versenyző vagyok?",
    a: "Újonc: nem versenyeztél még Magyar Országos Bajnokságon (open, I. osztály). Versenyző: az elmúlt 2 évben versenyeztél MOB-on és/vagy elérted a minősítési szintet.",
  },
  {
    q: "Mi van, ha betelik a létszám?",
    a: "A jelentkezésed várólistára kerül. Ha felszabadul hely, e-mailben keresünk, fizetni csak akkor kell, ha visszaigazoljuk.",
  },
  {
    q: "Milyen felszerelés kötelező?",
    a: "Versenyzőknek kantáros erőemelő mez, hosszú zokni, cipő és póló. Újoncoknak elegendő a testhez simuló ruházat. Részletek a Szabályok szekcióban.",
  },
  {
    q: "Hogyan fizethetek?",
    a: "Online, Stripe-on keresztül — a nevezés végén átirányítunk a fizetési oldalra.",
  },
  {
    q: "Mi van a nevezési díjban?",
    a: "Media csomag (profi fotók rólad) és egyedi SBD versenypóló. Prémium csomag külön vásárolható.",
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
