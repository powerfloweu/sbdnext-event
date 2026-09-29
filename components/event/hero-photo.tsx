"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

// The hero's own set — 2 men, 2 women, all distinct from PhotoStrip below
// (18 real photos total across both, none repeated) so the same face never
// shows up twice on the page.
const PHOTOS = [
  {
    src: "/photos/versenyzoferfi1-20.jpg",
    focus: "50% 20%",
    alt: {
      hu: "Versenyző ünnepli a sikeres emelést az SBD Next első kiadásán",
      en: "A lifter celebrates a successful lift at the first SBD Next",
    },
  },
  {
    src: "/photos/versenyzonoi-27.jpg",
    focus: "50% 15%",
    alt: { hu: "Felhúzás az A platformon", en: "Deadlift on the A platform" },
  },
  {
    src: "/photos/versenyzoferfi2-30.jpg",
    focus: "50% 15%",
    alt: { hu: "Felhúzás előtti felállás az A platformon", en: "Setting up for a deadlift on the A platform" },
  },
  {
    src: "/photos/ujoncnoi1-7.jpg",
    focus: "50% 15%",
    alt: { hu: "Fogás a rúdon guggolás előtt", en: "Taking grip on the bar before a squat" },
  },
];

const INTERVAL_MS = 5000;

interface HeroPhotoProps {
  locale?: "hu" | "en";
}

export function HeroPhoto({ locale = "hu" }: HeroPhotoProps) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setActive((i) => (i + 1) % PHOTOS.length), INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  return (
    <>
      {PHOTOS.map((p, idx) => (
        <Image
          key={p.src}
          src={p.src}
          alt={p.alt[locale]}
          fill
          priority={idx === 0}
          sizes="(min-width: 1024px) 560px, 100vw"
          style={{ objectPosition: p.focus }}
          className={`object-cover transition-opacity duration-1000 ${idx === active ? "opacity-100" : "opacity-0"}`}
        />
      ))}
    </>
  );
}
