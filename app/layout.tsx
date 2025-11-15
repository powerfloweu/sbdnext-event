import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://sbdnext-event.vercel.app"),
  title: "SBD Next – Nyílt Erőemelő Verseny | Thor Gym, 2026. február 14–15.",
  description:
    "SBD Next – 2 napos, IPF szabályrendszer szerinti powerlifting esemény újoncoknak és versenyzőknek a XI. kerületi Thor Gymben. Háromfogásos SBD verseny, media csomaggal és egyedi SBD versenypólóval.",
  openGraph: {
    title: "SBD Next – Nyílt Erőemelő Verseny",
    description:
      "2 nap, 2 platform, IPF szabályrendszer szerinti SBD verseny újoncoknak és versenyzőknek a Thor Gymben.",
    url: "https://sbdnext-event.vercel.app",
    siteName: "SBD Next",
    images: [
      {
        url: "/hero_bg.jpg",
        width: 1200,
        height: 630,
        alt: "SBD Next – powerlifting verseny a Thor Gymben",
      },
    ],
    locale: "hu_HU",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SBD Next – Nyílt Erőemelő Verseny",
    description:
      "Háromfogásos SBD verseny újoncoknak és versenyzőknek, media csomaggal és egyedi SBD pólóval.",
    images: ["/hero_bg.jpg"],
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="hu">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
      </body>
    </html>
  );
}