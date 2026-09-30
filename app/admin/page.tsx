import { AlertCircle } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { LogoutButton } from "@/components/admin/logout-button";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { getSupabaseServerAuth } from "@/lib/supabase/server-auth";
import { formatHUF } from "@/lib/format";

export const dynamic = "force-dynamic";

const STATUS_LABELS: Record<string, string> = {
  pending_payment: "Fizetésre vár",
  waitlist: "Várólista",
  paid: "Fizetve",
  cancelled: "Lemondva",
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

export default async function AdminPage() {
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

  const [{ data: registrations }, { data: notifySignups }] = await Promise.all([
    admin
      .from("registrations")
      .select("id, created_at, status, last_name, first_name, email, division, sex, club, total_fee, paid_at")
      .order("created_at", { ascending: false })
      .returns<RegistrationRow[]>(),
    admin
      .from("notify_signups")
      .select("id, created_at, email, locale, source, feedback_text, notified_at")
      .order("created_at", { ascending: false })
      .returns<NotifySignupRow[]>(),
  ]);

  const rows = registrations ?? [];
  const notify = notifySignups ?? [];
  const feedbackRows = notify.filter((r) => r.feedback_text);
  const paidTotal = rows.filter((r) => r.status === "paid").reduce((sum, r) => sum + r.total_fee, 0);

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
          { label: "Nevezések", value: rows.length },
          { label: "Fizetve", value: rows.filter((r) => r.status === "paid").length },
          { label: "Bevétel (fizetett)", value: `${formatHUF(paidTotal)} Ft` },
          { label: "Notify feliratkozók", value: notify.length },
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
        <h2 className="mb-3 text-lg font-semibold">Nevezések ({rows.length})</h2>
        <Card className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
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
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-4 text-center text-muted-foreground">
                    Még nincs nevezés.
                  </td>
                </tr>
              ) : (
                rows.map((r) => (
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
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </Card>
      </section>

      <section className="mb-10">
        <h2 className="mb-3 text-lg font-semibold">Notify feliratkozók ({notify.length})</h2>
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
                    Még nincs feliratkozó.
                  </td>
                </tr>
              ) : (
                notify.map((n) => (
                  <tr key={n.id}>
                    <td className="p-3 whitespace-nowrap text-muted-foreground">{fmtDate(n.created_at)}</td>
                    <td className="p-3">{n.email}</td>
                    <td className="p-3 uppercase">{n.locale}</td>
                    <td className="p-3 text-muted-foreground">{n.source}</td>
                    <td className="p-3 text-muted-foreground">{fmtDate(n.notified_at)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </Card>
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
