// A plain-language diagram of how a registration moves through the system —
// for D and Fekete Miklós to review together on /admin. Deliberately static
// JSX (no chart library): the shapes only need to communicate the pipeline,
// not render real data, and this stays in sync with app/api/register/route.ts,
// app/api/stripe/webhook/route.ts and app/admin/actions.ts by hand.

interface FlowStep {
  title: string;
  detail: string;
  tone: "collect" | "store" | "pay" | "notify" | "admin";
}

const TONE_CLASSES: Record<FlowStep["tone"], string> = {
  collect: "border-blue-400/40 bg-blue-500/10",
  store: "border-amber-400/40 bg-amber-500/10",
  pay: "border-purple-400/40 bg-purple-500/10",
  notify: "border-emerald-400/40 bg-emerald-500/10",
  admin: "border-rose-400/40 bg-rose-500/10",
};

const TONE_LABELS: Record<FlowStep["tone"], string> = {
  collect: "Adatfelvétel",
  store: "Tárolás",
  pay: "Fizetés",
  notify: "Értesítés",
  admin: "Admin",
};

const STEPS: FlowStep[] = [
  {
    tone: "collect",
    title: "1. Nevező kitölti a /nevezes űrlapot",
    detail:
      "Név, e-mail, szül. év, nem, kategória, klub, testsúly, nyitó fogások, póló, prémium média, arcfotó.",
  },
  {
    tone: "store",
    title: "2. Beírás a Supabase „registrations” táblába",
    detail:
      "Státusz: pending_payment vagy waitlist (ha betelt a létszám). Az arcfotó külön, privát tárhelyre kerül. Service-role kulccsal, RLS mögött — nincs publikus hozzáférés.",
  },
  {
    tone: "notify",
    title: "3. „Jelentkezés megérkezett” e-mail",
    detail: "Automatikus visszaigazolás a megadott címre.",
  },
  {
    tone: "pay",
    title: "4. Stripe Checkout",
    detail: "A nevező a nevezési díjat (+ póló/média felár) online kártyával fizeti.",
  },
  {
    tone: "store",
    title: "5. Stripe webhook → státusz „paid”",
    detail: "A webhook állítja a registrations sort fizetettre, menti a Stripe tranzakció-azonosítót.",
  },
  {
    tone: "notify",
    title: "6. „Fizetés megérkezett” e-mail",
    detail: "Végleges visszaigazolás a nevezőnek.",
  },
  {
    tone: "admin",
    title: "7. Admin felület (/admin)",
    detail:
      "Google-login + e-mail allowlist (jelenleg: trainer.pod@gmail.com, feketemiklos@gmail.com). Itt látható minden nevezés, kereshető/szűrhető, CSV-exportálható, és kézzel is állítható a státusz (pl. Fizetve / Lemondás — banki átutalásos fizetéshez).",
  },
];

export function RegistrationFlowchart() {
  return (
    <section className="mb-10">
      <h2 className="mb-1 text-lg font-semibold">Nevezési folyamat</h2>
      <p className="mb-4 text-sm text-muted-foreground">
        Hogyan jut el egy nevezés a kitöltött űrlaptól a fizetett, admin által is látott státuszig.
      </p>
      <div className="flex flex-col gap-2">
        {STEPS.map((step, i) => (
          <div key={step.title} className="flex items-start gap-3">
            <div className={`w-full rounded-lg border p-3 ${TONE_CLASSES[step.tone]}`}>
              <div className="mb-1 flex items-center gap-2">
                <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {TONE_LABELS[step.tone]}
                </span>
              </div>
              <div className="text-sm font-medium">{step.title}</div>
              <div className="mt-0.5 text-xs text-muted-foreground">{step.detail}</div>
            </div>
            {i < STEPS.length - 1 && (
              <span className="sr-only">majd</span>
            )}
          </div>
        ))}
      </div>
      <div className="mt-4 rounded-lg border border-dashed border-border p-3 text-xs text-muted-foreground">
        <span className="font-medium text-foreground">Jelenleg nincs önkiszolgáló szerkesztés:</span>{" "}
        a nevező egy beküldött nevezését csak az admin tudja módosítani (a fenti 7. lépés), mert még
        nincs megépítve a visszaigazoló e-mailbeli „nevezés szerkesztése” link.
      </div>
    </section>
  );
}
