"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

// Source photos are full-body portrait shots; the object-position keeps the
// lifter(s) in frame instead of the default center crop, which cut off heads
// when a tall portrait image covers a landscape box.
//
// These are shown at full clarity even before registration/pricing details
// are announced — real photos from SBD Next 1 are the point of the teaser
// phase (mood, not logistics). See FeesTeaser/Hero for where the actual
// date and price get withheld instead. 14 distinct photos, none repeated
// from HeroPhoto's 4 — real variety, not the same two faces everywhere.
const PHOTOS = [
  {
    src: "/photos/strip-1.jpg",
    focus: "50% 15%",
    alt: { hu: "Versenyzők a felhúzás előtt az SBD Next első kiadásán", en: "Lifters before a deadlift at the first SBD Next" },
  },
  {
    src: "/photos/strip-2.jpg",
    focus: "50% 10%",
    alt: { hu: "Guggolás segítővel az A platformon", en: "Squat with a spotter on the A platform" },
  },
  {
    src: "/photos/strip-3.jpg",
    focus: "50% 10%",
    alt: { hu: "Guggolás segítővel az A platformon", en: "Squat with a spotter on the A platform" },
  },
  {
    src: "/photos/strip-4.jpg",
    focus: "50% 15%",
    alt: { hu: "Krétázás a fellépés előtt", en: "Chalking up before stepping on the platform" },
  },
  {
    src: "/photos/hero-desktop.jpg",
    focus: "50% 20%",
    alt: { hu: "Versenyző a felhúzás előtt az SBD Next első kiadásán", en: "A lifter before a deadlift at the first SBD Next" },
  },
  {
    src: "/photos/hero-mobile.jpg",
    focus: "50% 10%",
    alt: { hu: "Felhúzás az A platformon, csapat a háttérben", en: "Deadlift on the A platform, team in the background" },
  },
  {
    src: "/photos/versenyzonoi-17.jpg",
    focus: "50% 15%",
    alt: { hu: "Krétázás a fellépés előtt", en: "Chalking up before stepping on the platform" },
  },
  {
    src: "/photos/versenyzonoi-29.jpg",
    focus: "50% 15%",
    alt: { hu: "Versenyzők a színfalak mögött", en: "Lifters backstage" },
  },
  {
    src: "/photos/ujoncnoi1-8.jpg",
    focus: "50% 12%",
    alt: { hu: "Guggolás a rakaton, segítővel", en: "Squat on the rack, with a spotter" },
  },
  {
    src: "/photos/ujoncnoi1-9.jpg",
    focus: "50% 12%",
    alt: { hu: "Fogás a rúdon guggolás előtt", en: "Taking grip on the bar before a squat" },
  },
  {
    src: "/photos/versenyzoferfi1-4.jpg",
    focus: "50% 15%",
    alt: { hu: "Versenyzők a rakat körül", en: "Lifters around the squat rack" },
  },
  {
    src: "/photos/versenyzoferfi1-8.jpg",
    focus: "50% 10%",
    alt: { hu: "Versenyző felkészül a következő emelésre", en: "A lifter preparing for the next attempt" },
  },
  {
    src: "/photos/versenyzoferfi2-9.jpg",
    focus: "50% 10%",
    alt: { hu: "Versenyző szíjazás közben", en: "A lifter wrapping up before an attempt" },
  },
  {
    src: "/photos/versenyzoferfi2-20.jpg",
    focus: "50% 15%",
    alt: { hu: "Versenyző a platformon, csapat a háttérben", en: "A lifter on the platform, team in the background" },
  },
];

const INTERVAL_MS = 4500;

interface PhotoStripProps {
  locale?: "hu" | "en";
}

export function PhotoStrip({ locale = "hu" }: PhotoStripProps) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setActive((i) => (i + 1) % PHOTOS.length), INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-4 sm:px-8">
      <div className="relative aspect-[16/9] overflow-hidden rounded-xl border border-border sm:aspect-[21/9]">
        {PHOTOS.map((p, idx) => (
          <Image
            key={p.src}
            src={p.src}
            alt={p.alt[locale]}
            fill
            sizes="(min-width: 1024px) 1152px, 100vw"
            style={{ objectPosition: p.focus }}
            className={`object-cover transition-opacity duration-1000 ${idx === active ? "opacity-100" : "opacity-0"}`}
            priority={idx === 0}
          />
        ))}
        <div className="absolute inset-x-0 bottom-0 flex justify-center gap-1.5 p-3">
          {PHOTOS.map((p, idx) => (
            <button
              key={p.src}
              type="button"
              aria-label={locale === "en" ? `Photo ${idx + 1}` : `Kép ${idx + 1}`}
              aria-current={idx === active}
              onClick={() => setActive(idx)}
              className={`size-2 rounded-full transition-colors ${
                idx === active ? "bg-primary" : "bg-white/50 hover:bg-white/80"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
