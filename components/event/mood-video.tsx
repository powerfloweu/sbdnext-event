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
// straight ruler-line would look too literal anyway). Long and winding on
// purpose: it has to visually bridge the gap up to the fee boxes above, not
// just sit as a short stub right next to the video.
function ExampleArrow({ locale = "hu" as const }: { locale?: "hu" | "en" }) {
  return (
    <div
      className="pointer-events-none absolute -top-24 -left-32 h-28 w-52 -rotate-2 text-primary sm:-top-32 sm:-left-48 sm:h-40 sm:w-72"
      aria-hidden="true"
    >
      <span className="absolute -top-1 left-0 -rotate-6 font-serif text-sm italic text-primary sm:text-base">
        {ARROW_LABEL[locale]}
      </span>
      <svg viewBox="0 0 220 160" fill="none" className="absolute inset-0 size-full">
        <defs>
          <marker id="example-arrowhead" markerWidth="7" markerHeight="7" refX="3.5" refY="3.5" orient="auto">
            <path d="M0 0 L7 3.5 L0 7 Z" fill="currentColor" />
          </marker>
        </defs>
        <path
          d="M12 18 C 60 -6, 10 58, 66 52 C 104 48, 86 90, 132 94 C 162 97, 154 118, 204 134"
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
    <div className="mt-6 flex flex-col gap-4 pb-4 sm:mt-8 sm:h-[320px] sm:flex-row">
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
