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
  hu: "Prémium Média",
  en: "Premium Media",
} as const;

interface AmbientVideoProps {
  playbackId: string;
  className?: string;
}

function AmbientVideo({ playbackId, className }: AmbientVideoProps) {
  const [ready, setReady] = useState(false);

  return (
    <div className={`pointer-events-none relative size-full overflow-hidden ${className ?? ""}`}>
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

// A single fixed-height row (same convention as VenueSection's map box)
// instead of two independently-sized aspect-ratio boxes — that's what made
// this look like a pile of mismatched shapes before. The wide clip fills
// whatever width is left; the vertical one keeps its true 9:16 shape
// (shrink-0 + aspect ratio, not stretched into a column), so it still
// visibly reads as vertical instead of being squashed toward square.
export function MoodVideoRow({ locale = "hu" }: LocaleProps) {
  return (
    <div className="flex flex-col gap-4 pb-4 sm:h-[320px] sm:flex-row">
      <div className="aspect-video overflow-hidden rounded-xl border border-border sm:aspect-auto sm:h-full sm:flex-1">
        <AmbientVideo playbackId={WIDE_CLIP} />
      </div>

      <Link
        href="/premium-media"
        className="group relative mx-auto aspect-[9/16] w-44 shrink-0 overflow-hidden rounded-xl border border-primary/30 transition-colors hover:border-primary/60 sm:mx-0 sm:h-full sm:w-auto"
      >
        <AmbientVideo playbackId={TALL_CLIP} />
        <span className="absolute inset-x-2 bottom-2 flex items-center gap-1.5 rounded-full bg-background/85 px-2.5 py-1 text-[11px] font-medium text-primary backdrop-blur-sm">
          <Sparkles className="size-3 shrink-0" aria-hidden="true" />
          <span className="truncate group-hover:underline">{PREMIUM_CAPTION[locale]}</span>
        </span>
      </Link>
    </div>
  );
}
