// Purely decorative, ambient haze — never obscures photos, only sits behind
// them (the parent must be `relative` and give this a lower stacking order,
// e.g. render it first and give the actual content `relative z-10`). Two
// soft, slowly drifting blurred blobs in the brand red + a warmer ember
// tone, echoing the red stage lighting/smoke already visible in the real
// event photos.
export function FogGlow() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
      <div
        className="absolute -left-[10%] -top-[20%] size-[70%] rounded-full bg-primary/15 blur-[140px]"
        style={{ animation: "fog-drift-a 16s ease-in-out infinite" }}
      />
      <div
        className="absolute -right-[15%] bottom-[-25%] size-[65%] rounded-full bg-glow-ember/12 blur-[150px]"
        style={{ animation: "fog-drift-b 20s ease-in-out infinite" }}
      />
    </div>
  );
}
