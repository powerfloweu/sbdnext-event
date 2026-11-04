import { AlertTriangle } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { SubmitButton } from "@/components/admin/submit-button";
import { formatHUF } from "@/lib/format";
import { startAdminTest, stopAdminTest, simulateTestPayment, updateRegistrationStatus } from "@/app/admin/actions";

interface TestRegistrationRow {
  id: string;
  created_at: string;
  status: string;
  last_name: string;
  first_name: string;
  email: string;
  total_fee: number;
}

const STATUS_LABELS: Record<string, string> = {
  pending_payment: "Fizetésre vár",
  waitlist: "Várólista",
  paid: "Fizetve (szimulált)",
  cancelled: "Törölve",
};

function fmtDate(iso: string): string {
  return new Intl.DateTimeFormat("hu-HU", { dateStyle: "short", timeStyle: "short" }).format(new Date(iso));
}

interface AdminTestTabProps {
  registrations: TestRegistrationRow[];
  priorYearSample: { email: string; last_name: string; first_name: string } | null;
}

// A self-contained guide + the controls to run it, so Miki can do this from
// just being logged into /admin — no separate doc to go find. See
// lib/admin-test.ts / app/admin/actions.ts for how the bypass itself works.
export function AdminTestTab({ registrations, priorYearSample }: AdminTestTabProps) {
  return (
    <div className="space-y-8">
      <section>
        <h2 className="mb-3 text-lg font-semibold">Teszt nevezés — lépésről lépésre</h2>
        <Card>
          <CardContent className="space-y-4 p-5 text-sm">
            <p className="flex items-start gap-2 text-amber-700">
              <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              Ez a <b>valós, éles oldalon</b> fut. A nevezés nem kerül be a nyilvános
              nevezések közé, nem megy ki rá hírlevél/Sheet. A fizetés szimulált (6. pont) — valódi
              Stripe-fizetés nem indul.
            </p>

            <ol className="list-decimal space-y-3 pl-5">
              <li>
                Kattints a <b>&bdquo;Teszt mód indítása&rdquo;</b> gombra lent. Ez átvisz a{" "}
                <code className="rounded bg-muted px-1">/nevezes</code> oldalra, ahol — a nevezés
                nyitási időpontjától függetlenül — megjelenik a nevezési űrlap, felül egy sárga
                &bdquo;TESZT MÓD&rdquo; sávval.
              </li>
              <li>Töltsd ki az űrlapot végig, valós fotóval/adatokkal is tesztelhető (nem lesz nyilvános).</li>
              <li>
                Az arcfotó <b>nem kötelező</b> — kihagyva is tovább tudsz lépni, és a visszaigazoló
                e-mail linkjén bármikor pótolható a verseny előttig (lásd 7. pont).
              </li>
              <li>
                A &bdquo;Tavaly már versenyeztél? Töltsd ki automatikusan&rdquo; gombot egy{" "}
                <b>tavalyi (SBD Next 1) versenyző e-mail címével</b> tudod tesztelni.{" "}
                {priorYearSample ? (
                  <>
                    Például ezzel: <code className="rounded bg-muted px-1">{priorYearSample.email}</code>{" "}
                    ({priorYearSample.last_name} {priorYearSample.first_name}).
                  </>
                ) : (
                  "A Súlycsoport-statisztika tab csak összesítést mutat, konkrét e-mailt nem — jelenleg nincs tavalyi versenyző a táblában."
                )}
              </li>
              <li>
                Küldés után a visszaigazoló e-mail (a jelentkezés megérkezett) megérkezik a
                megadott címre — nézd át, ez a valódi sablon.
              </li>
              <li>
                A fizetéshez <b>nem</b> dob ki valódi Stripe-oldalt, hanem rögtön a
                &bdquo;köszönjük&rdquo; oldalra érkezel. A fizetett állapotot és a fizetési
                visszaigazoló e-mailt itt lent, a teszt nevezés mellett a{" "}
                <b>&bdquo;Fizetés szimulálása&rdquo;</b> gombbal tudod kiváltani.
              </li>
              <li>
                Az önkiszolgáló szerkesztő linket a visszaigazoló e-mailekben tesztelheted (adatok
                módosítása, póló, arcfotó pótlása/cseréje stb.).
              </li>
              <li>
                Ha végeztél, a &bdquo;Törlés&rdquo; gombbal zárd le a teszt nevezést (ez
                lemondottra állítja, nem törli — valódi törlés az adatbázisból nincs), és a
                &bdquo;Teszt mód leállítása&rdquo; gombbal zárd le a nevezési oldal tesztelését.
              </li>
            </ol>

            <div className="flex flex-wrap gap-2 pt-2">
              <form action={startAdminTest}>
                <SubmitButton pendingLabel="Indítás…">Teszt mód indítása</SubmitButton>
              </form>
              <form action={stopAdminTest}>
                <SubmitButton variant="secondary" pendingLabel="Leállítás…">
                  Teszt mód leállítása
                </SubmitButton>
              </form>
            </div>
          </CardContent>
        </Card>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Teszt nevezések ({registrations.length})</h2>
        <Card className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-border text-xs uppercase text-muted-foreground">
              <tr>
                <th className="p-3">Beérkezett</th>
                <th className="p-3">Név</th>
                <th className="p-3">E-mail</th>
                <th className="p-3">Státusz</th>
                <th className="p-3">Összeg</th>
                <th className="p-3">Művelet</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {registrations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-4 text-center text-muted-foreground">
                    Nincs teszt nevezés.
                  </td>
                </tr>
              ) : (
                registrations.map((r) => (
                  <tr key={r.id}>
                    <td className="p-3 whitespace-nowrap text-muted-foreground">{fmtDate(r.created_at)}</td>
                    <td className="p-3 font-medium">
                      {r.last_name} {r.first_name}
                    </td>
                    <td className="p-3 text-muted-foreground">{r.email}</td>
                    <td className="p-3">{STATUS_LABELS[r.status] ?? r.status}</td>
                    <td className="p-3 whitespace-nowrap">{formatHUF(r.total_fee)} Ft</td>
                    <td className="p-3">
                      <div className="flex flex-wrap gap-1.5">
                        {r.status !== "paid" && r.status !== "cancelled" && (
                          <form action={simulateTestPayment}>
                            <input type="hidden" name="id" value={r.id} />
                            <input type="hidden" name="redirectTo" value="/admin" />
                            <SubmitButton variant="secondary" size="sm" pendingLabel="Fizetés rögzítése…">
                              Fizetés szimulálása
                            </SubmitButton>
                          </form>
                        )}
                        {r.status !== "cancelled" && (
                          <form action={updateRegistrationStatus}>
                            <input type="hidden" name="id" value={r.id} />
                            <input type="hidden" name="status" value="cancelled" />
                            <input type="hidden" name="redirectTo" value="/admin" />
                            <SubmitButton
                              variant="ghost"
                              size="sm"
                              pendingLabel="Törlés…"
                              confirmMessage={`Biztosan lezárod (lemondottra állítod) ${r.last_name} ${r.first_name} teszt nevezését?`}
                            >
                              Törlés
                            </SubmitButton>
                          </form>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </Card>
      </section>
    </div>
  );
}
