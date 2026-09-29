"use client";

import { useEffect, useState } from "react";
import MuxPlayer from "@mux/mux-player-react";
import minimalTheme from "@mux/mux-player-react/themes/minimal";
import type { MuxPlayerCSSProperties } from "@mux/mux-player-react";

// Real hangulatvideó clips from SBD Next 1, hosted on Mux. Picked at random
// per visit — muted/looped/no-UI ambient background, not a video the
// visitor is meant to interact with (hence pointer-events-none + minimal
// theme below), so which one plays doesn't need to be deterministic.
const PLAYBACK_IDS = [
  "e02BCIgy36h2sNM3ZE00U5Ux8wf00tUncXcoGwJ6sb8iyQ",
  "4cWc4xwHA202ZrAvyP01GoHEbqRIPkS02gZi8cE01f4NX6Q",
];

export function HeroVideo() {
  const [playbackId, setPlaybackId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setPlaybackId(PLAYBACK_IDS[Math.floor(Math.random() * PLAYBACK_IDS.length)]);
  }, []);

  if (!playbackId) return null;

  return (
    <div className="pointer-events-none absolute inset-0 size-full overflow-hidden">
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
