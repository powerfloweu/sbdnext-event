import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProfileImage } from "@/components/ui/profile-image";
import { EVENT } from "@/config/event";
import { formatHUF } from "@/lib/format";

export default function PremiumMediaPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
      <Card>
        <CardContent className="p-8">
          <h1 className="mb-6 text-3xl font-bold text-primary">
            A versenyed napja. Dokumentálva.
          </h1>
          <p className="mb-4 text-foreground/90">
            Az SBD Next napján sok minden történik egyszerre.
            <br />A bemelegítés ritmusa, a ráhangolódás, ahogy bemagnéziázod a kezedet,
            becsattintod az övedet, majd kilépsz a platformra.
            <br />
            Ezután egyperces szakaszok következnek, amelyek teljes egészében a tiéd.
            <br />
            <br />A Premium Media Package célja, hogy ez a nap az egyik legerősebb emlékként
            maradjon meg számodra.
          </p>

          <h2 className="mt-8 mb-3 text-xl font-semibold">A stáb, akik készítik</h2>
          <p className="mb-4 text-foreground/90">
            A prémium csomagot olyan szakemberek készítik, akik tapasztaltak versenykörnyezetben,
            és sok esetben maguk is erőemelő versenyzők.
          </p>
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {EVENT.mediaTeam.map((member) => (
              <div key={member.name} className="flex items-center gap-3">
                <ProfileImage
                  src={member.img}
                  alt={member.name + " profilképe"}
                  className="size-12 rounded-full border-2 border-primary bg-accent object-cover"
                />
                <div>
                  <div className="font-bold text-foreground">{member.name}</div>
                  <div className="text-xs text-muted-foreground">{member.role}</div>
                  <a
                    href={`https://instagram.com/${member.instagram}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline"
                  >
                    @{member.instagram}
                  </a>
                </div>
              </div>
            ))}
          </div>

          <p className="mb-6 text-foreground/80">
            A cél nem pusztán a látvány.
            <br />A cél az, hogy az adott pillanat pontosan és profi módon legyen rögzítve.
          </p>

          <Card className="mb-6 border-primary/40 bg-primary/5">
            <CardContent className="p-4">
              <span className="mb-2 block text-sm font-semibold text-primary">
                Fontos tudnivaló
              </span>
              <span className="block text-foreground">
                A Premium Media Package limitált számban érhető el a stáb kapacitása miatt.
              </span>
            </CardContent>
          </Card>

          <Button asChild size="lg" className="mb-4 w-full whitespace-normal text-center">
            <a href={EVENT.stripe.premiumOnly} target="_blank" rel="noopener noreferrer">
              Biztosítsd a helyedet még ma – {formatHUF(EVENT.fees.premiumMedia)} Ft
            </a>
          </Button>

          <div className="mt-8 text-center">
            <Button asChild variant="secondary">
              <Link href="/">Vissza a főoldalra</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
