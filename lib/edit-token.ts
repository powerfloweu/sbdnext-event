// Random token for the self-service edit link — generated here (not by the
// DB) so app/api/register/route.ts can embed it straight into the
// confirmation e-mail. Web Crypto's getRandomValues is available in both the
// Node and Edge runtimes, unlike Node's `crypto.randomBytes`.
export function generateEditToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(24));
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}
