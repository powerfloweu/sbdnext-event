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
// date and price get withheld instead.
const PHOTOS = [
  { src: "/photos/strip-1.jpg", alt: "Versenyzők a felhúzás előtt az SBD Next első kiadásán", focus: "50% 15%" },
  { src: "/photos/strip-2.jpg", alt: "Felhúzás az A platformon", focus: "50% 10%" },
  { src: "/photos/strip-3.jpg", alt: "Guggolás két segítővel az A platformon", focus: "50% 10%" },
  { src: "/photos/strip-4.jpg", alt: "Krétázás a fellépés előtt", focus: "50% 15%" },
  { src: "/photos/hero-desktop.jpg", alt: "Versenyző a felhúzás előtt az SBD Next első kiadásán", focus: "50% 20%" },
  { src: "/photos/hero-mobile.jpg", alt: "Felhúzás az A platformon, csapat a háttérben", focus: "50% 10%" },
];

const INTERVAL_MS = 4500;

export function PhotoStrip() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setActive((i) => (i + 1) % PHOTOS.length), INTERVAL_MS);
    return () => clearInterval(id);
  }, [paused]);

  return (
    <div
      className="mx-auto max-w-6xl px-4 py-4 sm:px-8"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="relative aspect-[16/9] overflow-hidden rounded-xl border border-border sm:aspect-[21/9]">
        {PHOTOS.map((p, idx) => (
          <Image
            key={p.src}
            src={p.src}
            alt={p.alt}
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
              aria-label={`Kép ${idx + 1}`}
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
