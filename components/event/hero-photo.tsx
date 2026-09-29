"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

// Rotates through 2 photos with a man as the subject and 2 with a woman —
// deliberately the 4 solo shots from the library (not the 2 that show a
// mixed pair, so the split stays an unambiguous 2+2). Same "real photos,
// no favoritism" principle as PhotoStrip below, just a smaller, slower set
// sized for the hero's fixed-aspect box.
const PHOTOS = [
  {
    src: "/photos/hero-desktop.jpg",
    focus: "50% 35%",
    alt: {
      hu: "Versenyző a felhúzás előtt az SBD Next első kiadásán",
      en: "A lifter before a deadlift at the first SBD Next",
    },
  },
  {
    src: "/photos/hero-mobile.jpg",
    focus: "50% 10%",
    alt: {
      hu: "Versenyző a felhúzás előtt az SBD Next első kiadásán",
      en: "A lifter before a deadlift at the first SBD Next",
    },
  },
  {
    src: "/photos/strip-4.jpg",
    focus: "50% 15%",
    alt: { hu: "Krétázás a fellépés előtt", en: "Chalking up before stepping on the platform" },
  },
  {
    src: "/photos/strip-1.jpg",
    focus: "50% 15%",
    alt: {
      hu: "Versenyzők a felhúzás előtt az SBD Next első kiadásán",
      en: "Lifters before a deadlift at the first SBD Next",
    },
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
