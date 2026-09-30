import { ShieldCheck, ExternalLink } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Section } from "@/components/site/section";
import { EVENT } from "@/config/event";

const DOC_LINKS = [
  { href: EVENT.docs.rules, title: "IPF/MERSZ szabályzat (PDF)", subtitle: "Hivatalos szabálykönyv" },
  { href: EVENT.docs.invitation, title: "SBD Next versenykiírás (PDF)", subtitle: "Hivatalos kiírás, részletes infók" },
  { href: EVENT.docs.qualification, title: "MERSZ minősítési szintek", subtitle: "Férfi és női open szintek" },
];

export function RulesSection() {
  return (
    <Section id="rules" icon={ShieldCheck} eyebrow="Szabályok" title="Szabályok és felszerelés">
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardContent className="flex flex-col gap-3 p-6 text-sm text-foreground">
            <div className="font-semibold text-foreground">Versenyző kategória</div>
            <p className="text-muted-foreground">
              A MERSZ szabályai szerint kell versenyezni: kantáros erőemelő mez, hosszú zokni, cipő
              és póló kötelező. Ezen felül minden használható, ami az IPF RAW szabályain belül
              megengedett.
            </p>
            <div className="font-semibold text-foreground">Újonc kategória</div>
            <p className="text-muted-foreground">
              Nem kötelező a kantáros erőemelő mez, elegendő a testhez simuló rövid- vagy
              hosszúnadrág és felső. Rövid nadrág esetén a felhúzáshoz hosszú szárú zokni szükséges.
            </p>
            <p className="text-muted-foreground">
              Nem kell klubtagság és sportorvosi engedély. Felszerelés-ellenőrzés mindenki számára
              kötelező.
            </p>
          </CardContent>
        </Card>
        <div className="grid gap-3">
          {DOC_LINKS.map((doc) => (
            <a
              key={doc.href}
              href={doc.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3.5 text-sm transition-colors hover:border-primary/50"
            >
              <span className="flex flex-col">
                <span className="font-medium text-foreground">{doc.title}</span>
                <span className="text-xs text-muted-foreground">{doc.subtitle}</span>
              </span>
              <ExternalLink className="size-4 shrink-0 text-primary" aria-hidden="true" />
            </a>
          ))}
        </div>
      </div>
    </Section>
  );
}
