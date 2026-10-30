// A plain-language diagram of how a registration moves through the system —
// for D and Fekete Miklós to review together on /admin. Deliberately static
// JSX (no chart library): the shapes only need to communicate the pipeline,
// not render real data, and this stays in sync with app/api/register/route.ts,
// app/api/stripe/webhook/route.ts and app/admin/actions.ts by hand.
//
// Styled with the site's own design tokens (bg-card/border-border/text-primary
// etc. from app/globals.css), not raw Tailwind palette colors, so it reads as
// part of the SBD Next admin rather than a generic diagram pasted on top.

interface FlowStep {
  phase: string;
  title: string;
  detail: string;
  highlight?: boolean;
}

const STEPS: FlowStep[] = [
  {
    phase: "Adatfelvétel",
    title: "Nevező kitölti a /nevezes űrlapot",
    detail:
      "Név, e-mail, szül. év, nem, kategória, klub, testsúly, nyitó fogások (guggolás/fekvenyomás/felhúzás), MC-szöveg, megjegyzés, póló, prémium média, arcfotó.",
  },
  {
    phase: "Tárolás",
    title: "Beírás a Supabase „registrations” táblába",
    detail:
      "Státusz: pending_payment vagy waitlist (ha betelt a létszám). Az arcfotó külön, privát tárhelyre kerül. Service-role kulccsal, RLS mögött — nincs publikus hozzáférés.",
  },
  {
    phase: "Értesítés",
    title: "„Jelentkezés megérkezett” e-mail",
    detail: "Automatikus visszaigazolás a megadott címre.",
  },
  {
    phase: "Fizetés",
    title: "Stripe Checkout",
    detail: "A nevező a nevezési díjat (+ póló/média felár) online kártyával fizeti.",
  },
  {
    phase: "Tárolás",
    title: "Stripe webhook → státusz „paid”",
    detail: "A webhook állítja a registrations sort fizetettre, menti a Stripe tranzakció-azonosítót.",
  },
  {
    phase: "Értesítés",
    title: "„Fizetés megérkezett” e-mail",
    detail: "Végleges visszaigazolás a nevezőnek.",
  },
  {
    phase: "Admin",
    title: "Admin felület (/admin)",
    detail:
      "Google-login + e-mail allowlist (jelenleg: trainer.pod@gmail.com, feketemiklos@gmail.com). Itt látható minden nevezés, kereshető/szűrhető, CSV-exportálható, és kézzel is állítható a státusz (pl. Fizetve / Lemondás — banki átutalásos fizetéshez).",
    highlight: true,
  },
  {
    phase: "Önkiszolgáló",
    title: "„Nevezési adatok megtekintése / szerkesztése” link",
    detail:
      "Az e-mailekben (jelentkezés + fizetés) szereplő linken a nevező saját maga is javíthat (pólóméret 2027. jan. 13-ig, a többi adat 2027. jan. 30-ig). Az arcfotó ennél tovább, a verseny kezdetéig bármikor pótolható ugyanitt.",
  },
];

export function RegistrationFlowchart() {
  return (
    <section className="mb-10">
      <div className="eyebrow mb-1">Áttekintés</div>
      <h2 className="mb-1 text-xl">Nevezési folyamat</h2>
      <p className="mb-4 text-sm text-muted-foreground">
        Hogyan jut el egy nevezés a kitöltött űrlaptól a fizetett, admin által is látott státuszig.
      </p>
      <div className="flex flex-col">
        {STEPS.map((step, i) => (
          <div key={step.title} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div
                className={
                  "flex size-8 shrink-0 items-center justify-center rounded-full border font-display text-sm font-bold " +
                  (step.highlight
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-foreground")
                }
              >
                {i + 1}
              </div>
              {i < STEPS.length - 1 && <div className="my-1 w-px flex-1 bg-border" />}
            </div>
            <div
              className={
                "mb-3 w-full rounded-lg border p-3 " +
                (step.highlight ? "border-primary/40 bg-accent" : "border-border bg-card")
              }
            >
              <span className="font-display text-xs font-bold uppercase tracking-[0.1em] text-primary">
                {step.phase}
              </span>
              <div className="mt-1 text-sm font-semibold text-foreground">{step.title}</div>
              <p className="mt-0.5 text-xs text-muted-foreground">{step.detail}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
