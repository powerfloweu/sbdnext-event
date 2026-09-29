"use client";

import { useState } from "react";
import MuxPlayer from "@mux/mux-player-react";
import minimalTheme from "@mux/mux-player-react/themes/minimal";
import type { MuxPlayerCSSProperties } from "@mux/mux-player-react";
import { Video } from "lucide-react";

// Real hangulatvideó footage from SBD Next 1, hosted on Mux — a wide
// competition-floor shot plus a vertical hero-style lift, muted/looped/no-UI
// ambient background clips (not meant to be interacted with).
const WIDE_CLIP = "YcvaBQHYg700N2UvaivLIh5FWVIRNL6p3hy2pucQMMB8";
const TALL_CLIP = "XFu4KKs76zTtboo4tl02LPQ008hfFZgArfrxh2Z34ijRU";

const HEADING = { hu: "Hangulat az első SBD Nextről", en: "The vibe from the first SBD Next" } as const;

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

interface MoodVideoProps {
  locale?: "hu" | "en";
}

export function MoodVideo({ locale = "hu" }: MoodVideoProps) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-4 sm:px-8">
      <span className="eyebrow mb-3 flex items-center gap-1.5">
        <Video className="size-3.5" aria-hidden="true" />
        {HEADING[locale]}
      </span>
      <div className="grid gap-4 sm:grid-cols-3">
        <AmbientVideo playbackId={WIDE_CLIP} className="aspect-video sm:col-span-2" />
        <AmbientVideo playbackId={TALL_CLIP} className="aspect-[9/16] sm:col-span-1" />
      </div>
    </div>
  );
}
