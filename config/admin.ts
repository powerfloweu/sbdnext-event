// Allowlist for /admin — the dashboard shows registrant PII (names, emails,
// bodyweights), so access is limited to these two people rather than any
// Supabase-authenticated user. Update here if either address changes.
export const ADMIN_EMAILS = ["trainer.pod@gmail.com", "feketemiklos@gmail.com"];

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
}
