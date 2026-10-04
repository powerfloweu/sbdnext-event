// Bold, unmistakably-visible red haze for the pre-registration teaser
// phase. Fixed to the viewport (stays put while scrolling) and sits behind
// every section's actual content — solid cards/backgrounds (bg-card,
// buttons, photos) paint over it as normal, so it reads as a red wash
// through the negative space around "coming soon" content, echoing the red
// stage lighting already visible in the event photos. Render this once,
// gated on `phase === "announced"` — once real content replaces the
// placeholders in later phases, the caller simply stops rendering it, so
// the fog disappears on its own rather than needing its own logic.
export function FogGlow() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
      <div
        className="absolute -left-[10%] -top-[20%] size-[75%] rounded-full bg-primary/35 blur-[110px]"
        style={{ animation: "fog-drift-a 18s ease-in-out infinite" }}
      />
      <div
        className="absolute -right-[20%] top-[25%] size-[65%] rounded-full bg-glow-ember/28 blur-[120px]"
        style={{ animation: "fog-drift-b 22s ease-in-out infinite" }}
      />
      <div
        className="absolute -left-[15%] bottom-[-20%] size-[65%] rounded-full bg-primary/30 blur-[120px]"
        style={{ animation: "fog-drift-b 26s ease-in-out infinite" }}
      />
    </div>
  );
}
