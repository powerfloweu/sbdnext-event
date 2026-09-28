import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/site/section";
import { NotifySignupForm } from "@/components/notify-signup-form";
import { Dumbbell } from "lucide-react";

const STEPS = [
  {
    n: 1,
    title: "Kitöltöd az űrlapot",
    body: "Öt rövid lépés, a piszkozatot elmentjük, ha félbehagyod.",
  },
  {
    n: 2,
    title: "Fizetsz kártyával",
    body: "Biztonságos Stripe fizetés. A helyed a fizetéssel válik véglegessé.",
  },
  {
    n: 3,
    title: "Visszaigazolás e-mailben",
    body: "Azonnal megkapod a visszaigazolást és a teendőket a versenyig.",
  },
];

interface RegistrationTeaserProps {
  ctaLabel: string;
  ctaHref: string;
  note?: string;
  notifyForm?: boolean;
}

export function RegistrationTeaser({ ctaLabel, ctaHref, note, notifyForm = false }: RegistrationTeaserProps) {
  if (notifyForm) {
    return (
      <Section id="register" icon={Dumbbell} eyebrow="Nevezés" title="Szólunk, amint indul">
        <div className="flex max-w-md flex-col gap-4">
          {note && <p className="text-sm text-muted-foreground">{note}</p>}
          <NotifySignupForm />
          <a href={ctaHref} target="_blank" rel="noopener noreferrer" className="text-xs text-muted-foreground underline">
            {ctaLabel}
          </a>
        </div>
      </Section>
    );
  }

  return (
    <Section
      id="register"
      icon={Dumbbell}
      eyebrow="Nevezés"
      title="Három lépés a platformig"
    >
      <div className="grid gap-4 lg:grid-cols-[1fr_1.4fr] lg:items-center">
        <div className="flex flex-col gap-4">
          {note && <p className="text-sm text-muted-foreground">{note}</p>}
          <Button asChild size="lg" className="self-start">
            <a href={ctaHref}>{ctaLabel}</a>
          </Button>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {STEPS.map((s) => (
            <Card key={s.n}>
              <CardContent className="flex flex-col gap-2 p-5">
                <span className="font-display text-3xl font-extrabold text-primary">
                  {s.n}
                </span>
                <span className="text-sm font-semibold text-foreground">{s.title}</span>
                <span className="text-xs text-muted-foreground">{s.body}</span>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </Section>
  );
}
