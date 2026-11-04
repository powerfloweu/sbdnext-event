import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProfileImage } from "@/components/ui/profile-image";
import { EVENT } from "@/config/event";

const ROLE_EN: Record<string, string> = {
  Fotós: "Photographer",
  Videós: "Videographer",
};

const title = "SBD Next II – Premium Media Package";
const description = "3 photos + 3 videos, hand-picked selection, by the SBD Next media team.";

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
    images: [{ url: "/photos/hero-desktop.jpg", width: 1600, height: 900, alt: "SBD Next" }],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/photos/hero-desktop.jpg"],
  },
};

export default function PremiumMediaPageEn() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
      <Card>
        <CardContent className="p-8">
          <h1 className="mb-6 text-3xl font-bold text-primary">
            Your competition day. Documented.
          </h1>
          <p className="mb-4 text-foreground/90">
            A lot happens at once on SBD Next day.
            <br />
            The rhythm of your warm-up, getting into the zone, chalking your hands, buckling
            your belt, then stepping out onto the platform.
            <br />
            After that come one-minute windows that are entirely yours.
            <br />
            <br />
            The Premium Media Package exists so that this day stays one of your strongest
            memories.
          </p>

          <h2 className="mt-8 mb-3 text-xl font-semibold">The crew behind it</h2>
          <p className="mb-4 text-foreground/90">
            The premium package is put together by people experienced in competition
            environments, many of them powerlifting competitors themselves.
          </p>
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {EVENT.mediaTeam.map((member) => (
              <div key={member.name} className="flex items-center gap-3">
                <ProfileImage
                  src={member.img}
                  alt={member.name + " profile photo"}
                  className="size-12 rounded-full border-2 border-primary bg-accent object-cover"
                />
                <div>
                  <div className="font-bold text-foreground">{member.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {ROLE_EN[member.role] ?? member.role}
                  </div>
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
            The goal isn&apos;t just the visuals.
            <br />
            The goal is to capture each moment precisely and professionally.
          </p>

          <Card className="mb-6 border-primary/40 bg-primary/5">
            <CardContent className="p-4">
              <span className="mb-2 block text-sm font-semibold text-primary">Good to know</span>
              <span className="block text-foreground">
                The Premium Media Package is available in limited numbers due to the crew&apos;s
                capacity.
              </span>
            </CardContent>
          </Card>

          <div className="mt-8 text-center">
            <Button asChild variant="secondary">
              <Link href="/en">Back to home</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
