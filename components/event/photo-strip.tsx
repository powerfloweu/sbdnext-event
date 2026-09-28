import Image from "next/image";

// Source photos are full-body portrait shots; the object-position keeps the
// lifter's face in frame instead of the default center crop, which cut off
// heads when a tall portrait image covers a landscape 4:3 box.
//
// These are shown at full clarity even before registration/pricing details
// are announced — real photos from SBD Next 1 are the point of the teaser
// phase (mood, not logistics). See FeesSection / Hero for where the actual
// date and price get withheld instead.
const PHOTOS = [
  {
    src: "/photos/strip-1.jpg",
    alt: "Újonc versenyző mosolyogva a felhúzás előtt",
    focus: "50% 12%",
  },
  {
    src: "/photos/strip-2.jpg",
    alt: "Guggolás két segítővel az A platformon",
    focus: "50% 10%",
  },
];

export function PhotoStrip() {
  return (
    <div className="mx-auto grid max-w-6xl grid-cols-2 gap-3 px-4 py-4 sm:px-8">
      {PHOTOS.map((p) => (
        <div key={p.src} className="relative aspect-[4/3] overflow-hidden rounded-xl border border-border">
          <Image
            src={p.src}
            alt={p.alt}
            fill
            sizes="(min-width: 640px) 380px, 50vw"
            style={{ objectPosition: p.focus }}
            className="object-cover"
          />
        </div>
      ))}
    </div>
  );
}
