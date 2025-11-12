// app/layout.tsx
import type { Metadata } from "next";
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
  title: "SBD Next — Új belépők versenye",
  description:
    "SBD Next: szabadidős erőemelő esemény újoncoknak és versenyzőknek. Nevezés, időrend, IPF szabályok, díjak, helyszín és GYIK.",
  metadataBase: new URL("https://sbdnext-event.vercel.app"),
  themeColor: "#ED1C24",
  icons: { icon: "/favicon.ico" },
  openGraph: {
    title: "SBD Next — Új belépők versenye",
    description:
      "Szabadidős, 2 napos powerlifting esemény a Thor Gymben. Media csomag + egyedi SBD póló.",
    url: "https://sbdnext-event.vercel.app",
    siteName: "SBD Next",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="hu">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}>
        {children}
      </body>
    </html>
  );
}