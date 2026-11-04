import { AlertTriangle } from "lucide-react";

// Shown on /nevezes whenever an admin is walking through the wizard via
// admin-test mode (see lib/admin-test.ts) — makes it obvious this isn't the
// real, publicly-open registration.
export function AdminTestBanner() {
  return (
    <div className="flex items-center justify-center gap-2 bg-amber-500 px-4 py-2 text-center text-sm font-semibold text-black">
      <AlertTriangle className="size-4" aria-hidden="true" />
      TESZT MÓD — ez a nevezés nem valós, nem jelenik meg a nyilvános nevezések között.
    </div>
  );
}
