// IPF GL Points formula (sex + bodyweight dependent, equipment-agnostic —
// same coefficients for classic and equipped). Coefficients as published by
// the IPF ("The GL Points Formula").
const COEFFICIENTS = {
  Férfi: { A: 1199.72839, B: 1025.18162, C: 0.00921 },
  Nő: { A: 610.32796, B: 1045.59282, C: 0.03048 },
} as const;

export function computeGLPoints(
  sex: "Férfi" | "Nő",
  bodyweightKg: number,
  totalKg: number
): number | null {
  if (!Number.isFinite(bodyweightKg) || bodyweightKg <= 0) return null;
  if (!Number.isFinite(totalKg) || totalKg <= 0) return null;

  const { A, B, C } = COEFFICIENTS[sex];
  const denominator = A - B * Math.exp(-C * bodyweightKg);
  if (denominator <= 0) return null;

  return (totalKg * 100) / denominator;
}
