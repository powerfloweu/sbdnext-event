import { Camera, Video, Shirt, TicketCheck } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Section } from "@/components/site/section";

const STRINGS = {
  hu: {
    eyebrow: "Nevezés",
    title: "Amit már most tudunk",
    footnote: "A pontos nevezési díjakat a nevezés megnyitásakor tesszük közzé.",
    items: [
      { title: "Fotó", body: "Benne van a nevezésben — mindenki kap profi fotókat a platformon." },
      { title: "Videó", body: "Extra prémium média csomagként rendelhető." },
      { title: "Póló", body: "Egyedi SBD versenypóló extra rendelhető." },
    ],
  },
  en: {
    eyebrow: "Registration",
    title: "What we already know",
    footnote: "Exact entry fees will be published once registration opens.",
    items: [
      { title: "Photos", body: "Included in your entry — everyone gets professional photos on the platform." },
      { title: "Video", body: "Can be ordered as an extra premium media package." },
      { title: "Shirt", body: "A custom SBD competition shirt can be ordered as an extra." },
    ],
  },
} as const;

const ICONS = [Camera, Video, Shirt];

interface FeesTeaserProps {
  locale?: "hu" | "en";
}

export function FeesTeaser({ locale = "hu" }: FeesTeaserProps) {
  const t = STRINGS[locale];
  return (
    <Section id="fees" icon={TicketCheck} eyebrow={t.eyebrow} title={t.title}>
      <Card>
        <CardContent className="grid gap-6 p-6 sm:grid-cols-3">
          {t.items.map((item, idx) => {
            const Icon = ICONS[idx];
            return (
              <div key={item.title} className="flex flex-col gap-2">
                <Icon className="size-5 text-primary" aria-hidden="true" />
                <span className="font-semibold text-foreground">{item.title}</span>
                <span className="text-sm text-muted-foreground">{item.body}</span>
              </div>
            );
          })}
        </CardContent>
      </Card>
      <p className="mt-3 text-xs text-muted-foreground">{t.footnote}</p>
    </Section>
  );
}
