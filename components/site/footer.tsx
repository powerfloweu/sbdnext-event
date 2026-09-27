import Image from "next/image";
import Link from "next/link";
import { Instagram } from "lucide-react";
import { EVENT } from "@/config/event";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-8 lg:grid-cols-[2fr_1fr_1fr_1fr]">
        <div className="flex flex-col gap-2">
          <span className="font-display text-2xl font-extrabold uppercase">SBD Next</span>
          <span className="text-sm text-muted-foreground">
            SBD Hungary × PowerFlow · Budapest
          </span>
          <span className="mt-3 text-xs text-muted-foreground">
            © {year} SBD Hungary &amp; PowerFlow
          </span>
        </div>

        <div className="flex flex-col gap-2 text-sm">
          <span className="font-semibold text-foreground">Kapcsolat</span>
          <a
            href={`mailto:${EVENT.contact.email}`}
            className="text-muted-foreground hover:text-foreground"
          >
            {EVENT.contact.email}
          </a>
          <a
            href={EVENT.social.igSbd}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground"
          >
            <Instagram className="size-4" aria-hidden="true" /> @sbd.hungary
          </a>
          <a
            href={EVENT.social.igPowerflow}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground"
          >
            <Instagram className="size-4" aria-hidden="true" /> @powerfloweu
          </a>
        </div>

        <div className="flex flex-col gap-2 text-sm">
          <span className="font-semibold text-foreground">Dokumentumok</span>
          <a
            href={EVENT.docs.invitation}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground"
          >
            Versenykiírás (PDF)
          </a>
          <a
            href={EVENT.docs.rules}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground"
          >
            IPF / MERSZ szabályzat
          </a>
          <Link href="/adatkezeles" className="text-muted-foreground hover:text-foreground">
            Adatkezelési tájékoztató
          </Link>
        </div>

        <div className="flex flex-col gap-3">
          <span className="text-sm font-semibold text-foreground">Nyelv</span>
          <div className="flex gap-3 text-sm">
            <span className="text-foreground">Magyar</span>
            <Link href="/en" className="text-muted-foreground hover:text-foreground">
              English
            </Link>
          </div>
          <div className="mt-2 flex items-center gap-4 opacity-80">
            <Image
              src="/sbd_logo_transparent.png"
              alt="SBD Hungary"
              width={80}
              height={28}
              className="h-6 w-auto object-contain"
            />
            <Image
              src="/powerflow_logo.png"
              alt="PowerFlow"
              width={80}
              height={28}
              className="h-6 w-auto object-contain"
            />
          </div>
        </div>
      </div>
    </footer>
  );
}
