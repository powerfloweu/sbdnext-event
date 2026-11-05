import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PrivacyNoticeContent } from "@/components/privacy-notice-content";
import { savePrivacyNoticeDraft, publishPrivacyNotice } from "@/app/admin/actions";
import type { PrivacyLocale } from "@/lib/privacy-notice";

export interface PrivacyNoticeRow {
  locale: PrivacyLocale;
  draft_text: string;
  note: string | null;
  updated_by: string | null;
  updated_at: string;
  published_text: string | null;
  published_by: string | null;
  published_at: string | null;
}

function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("hu-HU", { dateStyle: "short", timeStyle: "short" }).format(new Date(iso));
}

const LOCALE_LABELS: Record<PrivacyLocale, string> = { hu: "Magyar (/adatkezeles)", en: "English (/en/adatkezeles)" };

function PrivacyNoticeLocaleEditor({ row }: { row: PrivacyNoticeRow }) {
  const hasUnpublishedChanges = row.published_text !== row.draft_text;

  return (
    <Card>
      <CardContent className="flex flex-col gap-4 p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-lg font-semibold">{LOCALE_LABELS[row.locale]}</h3>
          <span className="text-xs text-muted-foreground">
            {row.published_at
              ? `Élesben: ${fmtDate(row.published_at)}${row.published_by ? ` (${row.published_by})` : ""}`
              : "Még nincs közzétéve — a nyilvános oldal a kódba írt alapértelmezett tervezetet mutatja."}
          </span>
        </div>

        <form action={savePrivacyNoticeDraft} className="flex flex-col gap-3">
          <input type="hidden" name="locale" value={row.locale} />
          <Textarea
            name="draftText"
            defaultValue={row.draft_text}
            rows={18}
            className="font-mono text-xs"
          />
          <Input
            name="note"
            defaultValue={row.note ?? ""}
            placeholder="Megjegyzés a másiknak (pl. mit nézzen át, mi változott)…"
          />
          {row.updated_by && (
            <p className="text-xs text-muted-foreground">
              Utoljára szerkesztette: {row.updated_by} ({fmtDate(row.updated_at)})
            </p>
          )}
          <div className="flex gap-2">
            <Button type="submit" variant="secondary" size="sm">
              Tervezet mentése
            </Button>
          </div>
        </form>

        <form action={publishPrivacyNotice}>
          <input type="hidden" name="locale" value={row.locale} />
          <Button type="submit" size="sm" disabled={!hasUnpublishedChanges}>
            {hasUnpublishedChanges ? "Közzététel (élesbe kerül)" : "Közzétéve, nincs új változás"}
          </Button>
        </form>

        <details>
          <summary className="cursor-pointer text-sm font-medium text-muted-foreground">
            Előnézet (így néz ki a mentett tervezet)
          </summary>
          <div className="mt-3 flex flex-col gap-1 rounded-lg border border-border p-4 text-sm text-foreground/90">
            <PrivacyNoticeContent text={row.draft_text} />
          </div>
        </details>
      </CardContent>
    </Card>
  );
}

// Lets D and Miki edit the privacy notice text directly from /admin instead
// of a code change each time — see app/admin/actions.ts
// (savePrivacyNoticeDraft/publishPrivacyNotice) and
// app/adatkezeles + app/en/adatkezeles (what the public reads).
export function PrivacyNoticeAdmin({ rows }: { rows: PrivacyNoticeRow[] }) {
  return (
    <section className="flex flex-col gap-6">
      <p className="text-sm text-muted-foreground">
        Itt szerkeszthető a /adatkezeles és /en/adatkezeles tartalma. A &quot;Tervezet mentése&quot; csak itt, az
        admin felületen látható — a nyilvános oldal csak a &quot;Közzététel&quot; gombra frissül. Formázás: sor elején
        &quot;## &quot; = címsor, &quot;- &quot; = felsorolás, &quot;**szöveg**&quot; = félkövér.
      </p>
      {rows.map((row) => (
        <PrivacyNoticeLocaleEditor key={row.locale} row={row} />
      ))}
    </section>
  );
}
