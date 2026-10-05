"use client";

import Link from "next/link";
import MuxPlayer from "@mux/mux-player-react";
import type { MuxPlayerCSSProperties } from "@mux/mux-player-react";
import { ArrowUpRight } from "lucide-react";

import { ProfileImage } from "@/components/ui/profile-image";
import { EVENT } from "@/config/event";
import { WIDE_CLIP, TALL_CLIP } from "@/components/event/mood-video";

// Same SBD Next 1 footage as the homepage's ambient MoodVideoRow, but here
// it's the actual preview of what a Premium Media buyer gets — so unlike
// the homepage version it keeps Mux's default controls (play/pause,
// scrubbable seek bar) instead of being a muted, no-UI background loop.
function PlayableClip({ playbackId, title }: { playbackId: string; title: string }) {
  return (
    <MuxPlayer
      playbackId={playbackId}
      streamType="on-demand"
      playsInline
      preload="metadata"
      thumbnailTime={5}
      metadata={{ video_title: title }}
      className="size-full"
      style={{ "--media-object-fit": "cover", "--media-object-position": "center" } as MuxPlayerCSSProperties}
    />
  );
}

export function PremiumMediaPreview() {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4">
      <div className="flex flex-col gap-3 sm:h-56 sm:flex-row">
        <div className="aspect-video overflow-hidden rounded-lg border border-border sm:aspect-auto sm:h-full sm:flex-1">
          <PlayableClip playbackId={WIDE_CLIP} title="SBD Next — prémium média példa (fekvő)" />
        </div>
        <div className="mx-auto aspect-[9/16] w-32 shrink-0 overflow-hidden rounded-lg border border-border sm:mx-0 sm:h-full sm:w-auto">
          <PlayableClip playbackId={TALL_CLIP} title="SBD Next — prémium média példa (álló)" />
        </div>
      </div>

      <div>
        <span className="mb-2 block text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          A stáb, akik készítik
        </span>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {EVENT.mediaTeam.map((member) => (
            <div key={member.name} className="flex items-center gap-2">
              <ProfileImage
                src={member.img}
                alt={member.name + " profilképe"}
                className="size-8 shrink-0 rounded-full border border-primary bg-accent object-cover"
              />
              <div className="min-w-0 text-xs">
                <div className="truncate font-semibold text-foreground">{member.name}</div>
                <div className="truncate text-muted-foreground">{member.role}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Link
        href="/premium-media"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
      >
        Teljes részletek és csapat
        <ArrowUpRight className="size-3.5" aria-hidden="true" />
      </Link>
    </div>
  );
}
