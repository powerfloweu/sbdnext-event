import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Barlow_Condensed } from "next/font/google";
import { EVENT } from "@/config/event";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const barlowCondensed = Barlow_Condensed({
  variable: "--font-barlow-condensed",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

const firstDay = EVENT.days[0];
const lastDay = EVENT.days[EVENT.days.length - 1];
const dateRangeLabel =
  EVENT.days.length > 1
    ? `${new Date(firstDay.date).getDate()}–${new Date(lastDay.date).getDate()}. ${new Intl.DateTimeFormat("hu-HU", { month: "long" }).format(new Date(firstDay.date))} (a 2. nap a nevezői létszámtól függ)`
    : new Intl.DateTimeFormat("hu-HU", { year: "numeric", month: "long", day: "numeric" }).format(
        new Date(firstDay.date)
      );

export const metadata: Metadata = {
  metadataBase: new URL(EVENT.siteUrl),
  title: `${EVENT.name} ${EVENT.edition} – Nyílt Erőemelő Verseny | ${EVENT.venue.name}, ${dateRangeLabel}`,
  description:
    "SBD Next – IPF szabályrendszer szerinti powerlifting esemény újoncoknak és versenyzőknek a Thor Gymben. Háromfogásos SBD verseny, media csomaggal és egyedi SBD versenypólóval.",
  openGraph: {
    title: `${EVENT.name} ${EVENT.edition} – Nyílt Erőemelő Verseny`,
    description:
      "IPF szabályrendszer szerinti SBD verseny újoncoknak és versenyzőknek a Thor Gymben.",
    url: EVENT.siteUrl,
    siteName: EVENT.name,
    images: [
      {
        url: "/photos/hero-desktop.jpg",
        width: 1600,
        height: 900,
        alt: "SBD Next – powerlifting verseny a Thor Gymben",
      },
    ],
    locale: "hu_HU",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${EVENT.name} ${EVENT.edition} – Nyílt Erőemelő Verseny`,
    description: "Háromfogásos SBD verseny újoncoknak és versenyzőknek.",
    images: ["/photos/hero-desktop.jpg"],
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  themeColor: "#0B0B0C",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="hu">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${barlowCondensed.variable} antialiased bg-background text-foreground`}
      >
        {children}
      </body>
    </html>
  );
}
