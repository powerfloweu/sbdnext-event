"use client";

import { useState } from "react";
import { MapPin, ExternalLink } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/site/section";
import { EVENT } from "@/config/event";

export function VenueSection() {
  const [mapLoaded, setMapLoaded] = useState(false);

  return (
    <Section id="venue" icon={MapPin} eyebrow="Helyszín" title={EVENT.venue.name}>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardContent className="flex flex-col gap-3 p-6 text-sm text-foreground">
            <div className="font-medium">{EVENT.venue.name}</div>
            <div className="text-muted-foreground">{EVENT.venue.address}</div>
            <div className="text-muted-foreground">{EVENT.venue.parking}</div>
            <div className="text-muted-foreground">{EVENT.venue.amenities}</div>
            <Button asChild variant="secondary" className="mt-2 self-start">
              <a href={EVENT.venue.mapsUrl} target="_blank" rel="noopener noreferrer">
                Útvonaltervezés
                <ExternalLink className="size-4" />
              </a>
            </Button>
          </CardContent>
        </Card>

        <div className="h-[300px] overflow-hidden rounded-xl border border-border bg-card sm:h-[360px]">
          {mapLoaded ? (
            <iframe
              title="Térkép"
              src={EVENT.venue.mapEmbedSrc}
              className="h-full w-full"
              style={{ border: 0 }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          ) : (
            <button
              type="button"
              onClick={() => setMapLoaded(true)}
              className="flex h-full w-full flex-col items-center justify-center gap-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
            >
              <MapPin className="size-6 text-primary" aria-hidden="true" />
              Térkép betöltése
            </button>
          )}
        </div>
      </div>
    </Section>
  );
}
