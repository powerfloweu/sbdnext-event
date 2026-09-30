import Link from "next/link";
import { HandHeart } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function VolunteerCta() {
  return (
    <section id="volunteer" className="scroll-mt-20 py-8">
      <Card>
        <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
          <HandHeart className="size-8 text-primary" aria-hidden="true" />
          <div className="flex flex-col gap-1">
            <h3>Önkéntes jelentkezés</h3>
            <p className="text-sm text-muted-foreground">
              Ha segítenél a versenyen, kattints ide a regisztrációhoz!
            </p>
          </div>
          <Button asChild size="lg">
            <Link href="/volunteers">Jelentkezem önkéntesnek</Link>
          </Button>
        </CardContent>
      </Card>
    </section>
  );
}
