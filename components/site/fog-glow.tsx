// Purely decorative, ambient haze for the pre-registration teaser phase.
// Fixed to the viewport (stays put while scrolling) and sits behind every
// section's actual content — solid cards/backgrounds (bg-card, buttons,
// photos) paint over it as normal, so in practice it only shows through in
// the empty negative space around "coming soon" content. Softens the
// "hamarosan" placeholders without ever touching a photo. Render this once,
// gated on `phase === "announced"` — once real content replaces the
// placeholders in later phases, the caller simply stops rendering it, so
// the fog disappears on its own rather than needing its own logic.
export function FogGlow() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
      <div
        className="absolute -left-[10%] -top-[15%] size-[55%] rounded-full bg-primary/12 blur-[140px]"
        style={{ animation: "fog-drift-a 18s ease-in-out infinite" }}
      />
      <div
        className="absolute -right-[15%] top-[30%] size-[50%] rounded-full bg-glow-ember/10 blur-[150px]"
        style={{ animation: "fog-drift-b 22s ease-in-out infinite" }}
      />
      <div
        className="absolute -left-[10%] bottom-[-15%] size-[50%] rounded-full bg-primary/10 blur-[150px]"
        style={{ animation: "fog-drift-b 26s ease-in-out infinite" }}
      />
    </div>
  );
}
