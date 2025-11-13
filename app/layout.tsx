// app/layout.tsx
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

// ---- SEO / META ----
export const metadata: Metadata = {
  title: "SBD Next — a következő versenyed",
  description:
    "SBD Next — szabadidős, 2 napos erőemelő esemény a Thor Gymben újoncoknak és versenyzőknek. Nevezés, időrend, IPF szabályok, díjak, helyszín és GYIK. Media csomag + egyedi SBD póló a nevezési díjban.",
  metadataBase: new URL("https://sbdnext-event.vercel.app"),
  openGraph: {
    title: "SBD Next — Lépj a következő szintre erőemelőként!",
    description:
      "Tehetségkutató verseny a Thor Gymben: 2 nap, 2 platform, IPF szabályrendszerrel.",
    url: "https://sbdnext-event.vercel.app",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SBD Next — a következő versenyed",
    description:
      "Szabadidős, 2 napos powerlifting esemény újoncoknak és versenyzőknek a Thor Gymben.",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

// 👈 IDE jön a themeColor, NEM a metadata-ba
export const viewport: Viewport = {
  themeColor: "#000000", // fekete böngészősáv mobilon
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