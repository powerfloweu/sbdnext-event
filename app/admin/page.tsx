import Link from "next/link";
import { AlertCircle } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LogoutButton } from "@/components/admin/logout-button";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { getSupabaseServerAuth } from "@/lib/supabase/server-auth";
import { formatHUF } from "@/lib/format";
import { updateRegistrationStatus } from "./actions";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 25;

const STATUS_LABELS: Record<string, string> = {
  pending_payment: "Fizetésre vár",
  waitlist: "Várólista",
  paid: "Fizetve",
  cancelled: "Lemondva",
};

const NOTIFY_SOURCE_LABELS: Record<string, string> = {
  site: "Weboldal",
  newsletter: "Hírlevél",
};

interface RegistrationRow {
  id: string;
  created_at: string;
  status: string;
  last_name: string;
  first_name: string;
  email: string;
  division: string;
  sex: string;
  club: string | null;
  total_fee: number;
  paid_at: string | null;
}

interface NotifySignupRow {
  id: string;
  created_at: string;
  email: string;
  locale: string;
  source: string;
  feedback_text: string | null;
  notified_at: string | null;
}

function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("hu-HU", { dateStyle: "short", timeStyle: "short" }).format(new Date(iso));
}

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function buildQuery(params: Record<string, string | undefined>): string {
  const sp = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) sp.set(key, value);
  }
  const qs = sp.toString();
  return qs ? `?${qs}` : "";
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const auth = await getSupabaseServerAuth();
  const {
    data: { user },
  } = await auth.auth.getUser();

  const admin = getSupabaseAdmin();

  if (!admin) {
    return (
      <div className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center gap-4 px-4 text-center">
        <AlertCircle className="size-10 text-destructive" aria-hidden="true" />
        <p className="text-sm text-muted-foreground">
          A Supabase nincs beállítva ezen a környezeten (hiányzó SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY).
        </p>
      </div>
    );
  }

  const sp = await searchParams;
  const q = firstValue(sp.q)?.trim() || "";
  const status = firstValue(sp.status) || "all";
  const page = Math.max(1, Number.parseInt(firstValue(sp.page) ?? "1", 10) || 1);

  const nq = firstValue(sp.nq)?.trim() || "";
  const nsource = firstValue(sp.nsource) || "all";
  const npage = Math.max(1, Number.parseInt(firstValue(sp.npage) ?? "1", 10) || 1);

  const regFrom = (page - 1) * PAGE_SIZE;
  const regTo = regFrom + PAGE_SIZE - 1;
  const notifyFrom = (npage - 1) * PAGE_SIZE;
  const notifyTo = notifyFrom + PAGE_SIZE - 1;

  let regQuery = admin
    .from("registrations")
    .select("id, created_at, status, last_name, first_name, email, division, sex, club, total_fee, paid_at", {
      count: "exact",
    })
    .order("created_at", { ascending: false });
  if (status !== "all") regQuery = regQuery.eq("status", status);
  if (q) {
    const escaped = q.replace(/[%_,]/g, "");
    if (escaped) {
      regQuery = regQuery.or(
        `last_name.ilike.%${escaped}%,first_name.ilike.%${escaped}%,email.ilike.%${escaped}%,club.ilike.%${escaped}%`
      );
    }
  }

  let notifyQuery = admin
    .from("notify_signups")
    .select("id, created_at, email, locale, source, feedback_text, notified_at", { count: "exact" })
    .order("created_at", { ascending: false });
  if (nsource !== "all") notifyQuery = notifyQuery.eq("source", nsource);
  if (nq) {
    const escaped = nq.replace(/[%_,]/g, "");
    if (escaped) notifyQuery = notifyQuery.ilike("email", `%${escaped}%`);
  }

  const [
    { data: registrations, count: regCount },
    { data: notifySignups, count: notifyCount },
    { data: statsRows },
    { count: totalNotifyCount },
    { data: feedbackSignups },
  ] = await Promise.all([
    regQuery.range(regFrom, regTo).returns<RegistrationRow[]>(),
    notifyQuery.range(notifyFrom, notifyTo).returns<NotifySignupRow[]>(),
    admin.from("registrations").select("status, total_fee").returns<{ status: string; total_fee: number }[]>(),
    admin.from("notify_signups").select("id", { count: "exact", head: true }),
    // Independent of the notify-signups table's own pagination/search above —
    // the feedback list below always shows every submitted answer.
    admin
      .from("notify_signups")
      .select("id, email, feedback_text")
      .not("feedback_text", "is", null)
      .order("created_at", { ascending: false })
      .returns<Pick<NotifySignupRow, "id" | "email" | "feedback_text">[]>(),
  ]);

  const rows = registrations ?? [];
  const notify = notifySignups ?? [];
  const feedbackRows = feedbackSignups ?? [];

  const allStats = statsRows ?? [];
  const totalRegistrations = allStats.length;
  const totalPaid = allStats.filter((r) => r.status === "paid").length;
  const paidTotal = allStats.filter((r) => r.status === "paid").reduce((sum, r) => sum + r.total_fee, 0);

  const regTotalPages = Math.max(1, Math.ceil((regCount ?? 0) / PAGE_SIZE));
  const notifyTotalPages = Math.max(1, Math.ceil((notifyCount ?? 0) / PAGE_SIZE));

  const regFilterQs = { q: q || undefined, status: status !== "all" ? status : undefined };
  const notifyFilterQs = { nq: nq || undefined, nsource: nsource !== "all" ? nsource : undefined };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-8">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">SBD Next — Admin</h1>
          <p className="text-sm text-muted-foreground">Bejelentkezve: {user?.email}</p>
        </div>
        <LogoutButton />
      </div>

      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Nevezések", value: totalRegistrations },
          { label: "Fizetve", value: totalPaid },
          { label: "Bevétel (fizetett)", value: `${formatHUF(paidTotal)} Ft` },
          { label: "Notify feliratkozók", value: totalNotifyCount ?? 0 },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="flex flex-col gap-1 p-4">
              <span className="text-xs text-muted-foreground">{s.label}</span>
              <span className="text-xl font-bold">{s.value}</span>
            </CardContent>
          </Card>
        ))}
      </div>

      <section className="mb-10">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">
            Nevezések ({regCount ?? 0})
          </h2>
          <a
            href={`/api/admin/export/registrations${buildQuery(regFilterQs)}`}
            className="text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            CSV export
          </a>
        </div>

        <form className="mb-3 flex flex-wrap gap-2" action="/admin">
          <Input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Keresés: név, e-mail, klub…"
            className="max-w-xs"
          />
          <select
            name="status"
            defaultValue={status}
            className="h-12 rounded-lg border border-input bg-card px-3.5 text-sm text-foreground"
          >
            <option value="all">Minden státusz</option>
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <Button type="submit" variant="secondary" size="sm">
            Szűrés
          </Button>
          {(q || status !== "all") && (
            <Button asChild variant="ghost" size="sm">
              <Link href="/admin">Törlés</Link>
            </Button>
          )}
        </form>

        <Card className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="border-b border-border text-xs uppercase text-muted-foreground">
              <tr>
                <th className="p-3">Beérkezett</th>
                <th className="p-3">Név</th>
                <th className="p-3">E-mail</th>
                <th className="p-3">Kategória</th>
                <th className="p-3">Nem</th>
                <th className="p-3">Klub</th>
                <th className="p-3">Státusz</th>
                <th className="p-3">Összeg</th>
                <th className="p-3">Művelet</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-4 text-center text-muted-foreground">
                    Nincs a szűrésnek megfelelő nevezés.
                  </td>
                </tr>
              ) : (
                rows.map((r) => {
                  const redirectTo = `/admin${buildQuery({ ...regFilterQs, page: page !== 1 ? String(page) : undefined })}`;
                  return (
                    <tr key={r.id}>
                      <td className="p-3 whitespace-nowrap text-muted-foreground">{fmtDate(r.created_at)}</td>
                      <td className="p-3 font-medium">
                        {r.last_name} {r.first_name}
                      </td>
                      <td className="p-3 text-muted-foreground">{r.email}</td>
                      <td className="p-3">{r.division}</td>
                      <td className="p-3">{r.sex}</td>
                      <td className="p-3 text-muted-foreground">{r.club || "—"}</td>
                      <td className="p-3">{STATUS_LABELS[r.status] ?? r.status}</td>
                      <td className="p-3 whitespace-nowrap">{formatHUF(r.total_fee)} Ft</td>
                      <td className="p-3">
                        <div className="flex flex-wrap gap-1.5">
                          {r.status !== "paid" && (
                            <form action={updateRegistrationStatus}>
                              <input type="hidden" name="id" value={r.id} />
                              <input type="hidden" name="status" value="paid" />
                              <input type="hidden" name="redirectTo" value={redirectTo} />
                              <Button type="submit" variant="secondary" size="sm">
                                Fizetve
                              </Button>
                            </form>
                          )}
                          {r.status !== "cancelled" && (
                            <form action={updateRegistrationStatus}>
                              <input type="hidden" name="id" value={r.id} />
                              <input type="hidden" name="status" value="cancelled" />
                              <input type="hidden" name="redirectTo" value={redirectTo} />
                              <Button type="submit" variant="ghost" size="sm">
                                Lemondás
                              </Button>
                            </form>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </Card>

        {regTotalPages > 1 && (
          <div className="mt-3 flex items-center justify-center gap-3 text-sm">
            <Button asChild variant="secondary" size="sm" disabled={page <= 1}>
              <Link href={`/admin${buildQuery({ ...regFilterQs, page: page > 1 ? String(page - 1) : undefined })}`}>
                Előző
              </Link>
            </Button>
            <span className="text-muted-foreground">
              {page} / {regTotalPages}
            </span>
            <Button asChild variant="secondary" size="sm" disabled={page >= regTotalPages}>
              <Link href={`/admin${buildQuery({ ...regFilterQs, page: String(page + 1) })}`}>Következő</Link>
            </Button>
          </div>
        )}
      </section>

      <section className="mb-10">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Notify feliratkozók ({notifyCount ?? 0})</h2>
          <a
            href={`/api/admin/export/notify${buildQuery(notifyFilterQs)}`}
            className="text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            CSV export
          </a>
        </div>

        <form className="mb-3 flex flex-wrap gap-2" action="/admin">
          {/* preserve the registrations filters as hidden fields so this form doesn't reset them */}
          {q && <input type="hidden" name="q" value={q} />}
          {status !== "all" && <input type="hidden" name="status" value={status} />}
          <Input type="search" name="nq" defaultValue={nq} placeholder="Keresés: e-mail…" className="max-w-xs" />
          <select
            name="nsource"
            defaultValue={nsource}
            className="h-12 rounded-lg border border-input bg-card px-3.5 text-sm text-foreground"
          >
            <option value="all">Minden forrás</option>
            {Object.entries(NOTIFY_SOURCE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <Button type="submit" variant="secondary" size="sm">
            Szűrés
          </Button>
          {(nq || nsource !== "all") && (
            <Button asChild variant="ghost" size="sm">
              <Link href={`/admin${buildQuery(regFilterQs)}`}>Törlés</Link>
            </Button>
          )}
        </form>

        <Card className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="border-b border-border text-xs uppercase text-muted-foreground">
              <tr>
                <th className="p-3">Feliratkozott</th>
                <th className="p-3">E-mail</th>
                <th className="p-3">Nyelv</th>
                <th className="p-3">Forrás</th>
                <th className="p-3">Értesítve</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {notify.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-4 text-center text-muted-foreground">
                    Nincs a szűrésnek megfelelő feliratkozó.
                  </td>
                </tr>
              ) : (
                notify.map((n) => (
                  <tr key={n.id}>
                    <td className="p-3 whitespace-nowrap text-muted-foreground">{fmtDate(n.created_at)}</td>
                    <td className="p-3">{n.email}</td>
                    <td className="p-3 uppercase">{n.locale}</td>
                    <td className="p-3 text-muted-foreground">{NOTIFY_SOURCE_LABELS[n.source] ?? n.source}</td>
                    <td className="p-3 text-muted-foreground">{fmtDate(n.notified_at)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </Card>

        {notifyTotalPages > 1 && (
          <div className="mt-3 flex items-center justify-center gap-3 text-sm">
            <Button asChild variant="secondary" size="sm" disabled={npage <= 1}>
              <Link
                href={`/admin${buildQuery({ ...notifyFilterQs, npage: npage > 1 ? String(npage - 1) : undefined })}`}
              >
                Előző
              </Link>
            </Button>
            <span className="text-muted-foreground">
              {npage} / {notifyTotalPages}
            </span>
            <Button asChild variant="secondary" size="sm" disabled={npage >= notifyTotalPages}>
              <Link href={`/admin${buildQuery({ ...notifyFilterQs, npage: String(npage + 1) })}`}>Következő</Link>
            </Button>
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Visszajelzések ({feedbackRows.length})</h2>
        {feedbackRows.length === 0 ? (
          <p className="text-sm text-muted-foreground">Még nem érkezett visszajelzés.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {feedbackRows.map((n) => (
              <Card key={n.id}>
                <CardContent className="flex flex-col gap-1 p-4 text-sm">
                  <span className="font-medium text-foreground">{n.email}</span>
                  <span className="text-muted-foreground">{n.feedback_text}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
