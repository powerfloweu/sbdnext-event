"use client";

import { useState } from "react";
import MuxPlayer from "@mux/mux-player-react";
import minimalTheme from "@mux/mux-player-react/themes/minimal";
import type { MuxPlayerCSSProperties } from "@mux/mux-player-react";

// Real hangulatvideó footage from SBD Next 1, hosted on Mux — muted/looped/
// no-UI ambient background clips (not meant to be interacted with).
const WIDE_CLIP = "YcvaBQHYg700N2UvaivLIh5FWVIRNL6p3hy2pucQMMB8";
const TALL_CLIP = "XFu4KKs76zTtboo4tl02LPQ008hfFZgArfrxh2Z34ijRU";

const ARROW_LABEL = { hu: "egy példa", en: "an example" } as const;

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

// A hand-drawn-style squiggly arrow pointing at the vertical clip, labeled
// "egy példa" — a playful nod at the Videó line item above rather than a
// pixel-anchored connector (the two live in different components, and a
// straight ruler-line would look too literal anyway).
function ExampleArrow({ locale = "hu" as const }: { locale?: "hu" | "en" }) {
  return (
    <div
      className="pointer-events-none absolute -top-14 -left-4 h-20 w-28 -rotate-3 text-primary sm:-top-16 sm:-left-10 sm:h-24 sm:w-32"
      aria-hidden="true"
    >
      <span className="absolute -top-1 left-0 -rotate-6 font-serif text-sm italic text-primary sm:text-base">
        {ARROW_LABEL[locale]}
      </span>
      <svg viewBox="0 0 120 90" fill="none" className="absolute inset-0 size-full">
        <defs>
          <marker id="example-arrowhead" markerWidth="7" markerHeight="7" refX="3.5" refY="3.5" orient="auto">
            <path d="M0 0 L7 3.5 L0 7 Z" fill="currentColor" />
          </marker>
        </defs>
        <path
          d="M8 30 C 45 20, 30 68, 58 66 C 78 64, 74 42, 104 58"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          markerEnd="url(#example-arrowhead)"
        />
      </svg>
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
    <div className="mt-10 flex flex-col gap-4 pb-4 sm:mt-14 sm:h-[320px] sm:flex-row">
      <div className="aspect-video overflow-hidden rounded-xl border border-border sm:aspect-auto sm:h-full sm:flex-1">
        <AmbientVideo playbackId={WIDE_CLIP} />
      </div>

      <div className="relative mx-auto aspect-[9/16] w-44 shrink-0 sm:mx-0 sm:h-full sm:w-auto">
        <ExampleArrow locale={locale} />
        <div className="absolute inset-0 overflow-hidden rounded-xl border border-primary/30">
          <AmbientVideo playbackId={TALL_CLIP} />
        </div>
      </div>
    </div>
  );
}
