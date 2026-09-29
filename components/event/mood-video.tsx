"use client";

import { useState } from "react";
import Link from "next/link";
import MuxPlayer from "@mux/mux-player-react";
import minimalTheme from "@mux/mux-player-react/themes/minimal";
import type { MuxPlayerCSSProperties } from "@mux/mux-player-react";
import { Sparkles } from "lucide-react";

// Real hangulatvideó footage from SBD Next 1, hosted on Mux — muted/looped/
// no-UI ambient background clips (not meant to be interacted with).
const WIDE_CLIP = "YcvaBQHYg700N2UvaivLIh5FWVIRNL6p3hy2pucQMMB8";
const TALL_CLIP = "XFu4KKs76zTtboo4tl02LPQ008hfFZgArfrxh2Z34ijRU";

const PREMIUM_CAPTION = {
  hu: "Így néz ki egy Prémium Média Csomagos felvétel",
  en: "This is what a Premium Media Package recording looks like",
} as const;

interface AmbientVideoProps {
  playbackId: string;
  className?: string;
}

function AmbientVideo({ playbackId, className }: AmbientVideoProps) {
  const [ready, setReady] = useState(false);

  return (
    <div className={`pointer-events-none relative overflow-hidden rounded-xl border border-border ${className ?? ""}`}>
      <MuxPlayer
        playbackId={playbackId}
        streamType="on-demand"
        autoPlay="muted"
        muted
        loop
        playsInline
        preload="auto"
        theme={minimalTheme}
        nohotkeys
        thumbnailTime={5}
        onCanPlay={() => setReady(true)}
        className={`absolute inset-0 size-full transition-opacity duration-1000 ${ready ? "opacity-100" : "opacity-0"}`}
        style={{ "--media-object-fit": "cover", "--media-object-position": "center" } as MuxPlayerCSSProperties}
        metadata={{ video_title: "SBD Next — hangulatvideó" }}
      />
    </div>
  );
}

interface LocaleProps {
  locale?: "hu" | "en";
}

// The general atmosphere clip — sits right under the "what's already
// included" boxes (Fotó / Videó / Póló) in FeesTeaser, as a mood beat, not a
// section with its own heading.
export function MoodVideoWide() {
  return <AmbientVideo playbackId={WIDE_CLIP} className="aspect-video w-full" />;
}

// The vertical clip specifically sold as a sample of the Video line item
// from FeesTeaser ("extra prémium média csomagként rendelhető") — captioned
// and linked to /premium-media so it reads as a preview, not just more mood.
export function PremiumMediaSample({ locale = "hu" }: LocaleProps) {
  return (
    <Link
      href="/premium-media"
      className="group flex flex-col gap-2 rounded-xl border border-primary/30 p-2 transition-colors hover:border-primary/60"
    >
      <AmbientVideo playbackId={TALL_CLIP} className="aspect-[9/16] w-full" />
      <span className="flex items-center gap-1.5 px-1 pb-1 text-xs font-medium text-primary">
        <Sparkles className="size-3.5 shrink-0" aria-hidden="true" />
        <span className="group-hover:underline">{PREMIUM_CAPTION[locale]}</span>
      </span>
    </Link>
  );
}
