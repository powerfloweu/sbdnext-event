import Image from "next/image";

const PHOTOS = [
  { src: "/photos/strip-1.jpg", alt: "Újonc versenyző mosolyogva a felhúzás előtt" },
  { src: "/photos/strip-2.jpg", alt: "Guggolás két segítővel az A platformon" },
];

export function PhotoStrip() {
  return (
    <div className="mx-auto grid max-w-6xl grid-cols-2 gap-3 px-4 py-4 sm:px-8">
      {PHOTOS.map((p) => (
        <div key={p.src} className="relative aspect-[4/3] overflow-hidden rounded-xl border border-border">
          <Image src={p.src} alt={p.alt} fill sizes="(min-width: 640px) 380px, 50vw" className="object-cover" />
        </div>
      ))}
    </div>
  );
}
