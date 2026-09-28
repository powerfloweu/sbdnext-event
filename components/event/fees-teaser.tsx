import { Camera, Video, Shirt, TicketCheck } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Section } from "@/components/site/section";

const ITEMS = [
  { icon: Camera, title: "Fotó", body: "Benne van a nevezésben — mindenki kap profi fotókat a platformon." },
  { icon: Video, title: "Videó", body: "Extra prémium média csomagként rendelhető." },
  { icon: Shirt, title: "Póló", body: "Egyedi SBD versenypóló extra rendelhető." },
];

export function FeesTeaser() {
  return (
    <Section id="fees" icon={TicketCheck} eyebrow="Nevezés" title="Amit már most tudunk">
      <Card>
        <CardContent className="grid gap-6 p-6 sm:grid-cols-3">
          {ITEMS.map((item) => (
            <div key={item.title} className="flex flex-col gap-2">
              <item.icon className="size-5 text-primary" aria-hidden="true" />
              <span className="font-semibold text-foreground">{item.title}</span>
              <span className="text-sm text-muted-foreground">{item.body}</span>
            </div>
          ))}
        </CardContent>
      </Card>
      <p className="mt-3 text-xs text-muted-foreground">
        A pontos nevezési díjakat a nevezés megnyitásakor tesszük közzé.
      </p>
    </Section>
  );
}
