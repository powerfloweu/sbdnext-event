import Image from "next/image";
import { EVENT } from "@/config/event";

interface SponsorGridProps {
  locale?: "hu" | "en";
}

export function SponsorGrid({ locale = "hu" }: SponsorGridProps) {
  return (
    <div className="flex flex-col items-center gap-4">
      <span className="eyebrow text-muted-foreground">
        {locale === "en" ? "Organisers and partners" : "Szervezők és partnerek"}
      </span>
      <div className="flex flex-wrap items-center justify-center gap-10">
        {EVENT.sponsors.map((s) => (
          <a
            key={s.name}
            href={s.url}
            target="_blank"
            rel="noopener noreferrer"
            className="opacity-80 grayscale transition hover:opacity-100 hover:grayscale-0"
          >
            <Image
              src={s.logo}
              alt={s.name}
              width={160}
              height={48}
              className="h-9 w-auto object-contain sm:h-12"
            />
          </a>
        ))}
      </div>
    </div>
  );
}
