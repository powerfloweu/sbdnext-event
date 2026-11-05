"use client";

import { use, useCallback, useEffect, useRef, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, CheckCircle2, Lock, Camera } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Field } from "@/components/forms/field";
import { compressImageToDataUrl } from "@/lib/client-image";

import { EVENT } from "@/config/event";
import { registrationEditSchema, type RegistrationEditInput } from "@/lib/validation/registration-edit";

type EditLocale = "hu" | "en";

type LoadState =
  | { status: "loading" }
  | { status: "not_found" }
  | {
      status: "ready";
      locale: EditLocale;
      allFieldsOpen: boolean;
      shirtOpen: boolean;
      wantsShirt: boolean;
      facePhotoEditOpen: boolean;
      hasFacePhoto: boolean;
    };

const MAX_FACE_PHOTO_MB = 20;

// The DB stores the original enum values ("Nő"/"Férfi", "Újonc"/"Versenyző",
// "Női"/"Férfi") regardless of locale, and the schema still validates
// against those — only the displayed label changes here. The HU labels
// match the versenykiírás's public category names (Tehetségkutató /
// Versenyzői), not the internal "Újonc"/"Versenyző" enum values.
const SEX_LABELS: Record<EditLocale, Record<string, string>> = {
  hu: { Nő: "Nő", Férfi: "Férfi" },
  en: { Nő: "Female", Férfi: "Male" },
};
const DIVISION_LABELS: Record<EditLocale, Record<string, string>> = {
  hu: { Újonc: "Tehetségkutató", Versenyző: "Versenyzői" },
  en: { Újonc: "Rookie", Versenyző: "Lifter" },
};
const SHIRT_CUT_LABELS: Record<EditLocale, Record<string, string>> = {
  hu: { Női: "Női", Férfi: "Férfi" },
  en: { Női: "Women's", Férfi: "Men's" },
};

interface PageStrings {
  loading: string;
  notFoundTitle: string;
  notFoundBody: string;
  editClosedTitle: string;
  editClosedBody: string;
  heading: string;
  intro: string;
  introShirtLocked: string;
  savedAlert: string;
  saveErrorAlert: string;
  lastName: string;
  firstName: string;
  birthYear: string;
  sex: string;
  selectPlaceholder: string;
  division: string;
  club: string;
  clubHint: string;
  bodyweight: string;
  openerSquat: string;
  openerBench: string;
  openerDeadlift: string;
  mcText: string;
  notes: string;
  optional: string;
  shirtCut: string;
  shirtCutLockedHint: string;
  shirtSize: string;
  save: string;
  saving: string;
  facePhotoTitle: string;
  facePhotoHint: string;
  facePhotoHintReplacing: string;
  facePhotoReplace: string;
  facePhotoSelect: string;
  facePhotoSelectAria: string;
  facePhotoProcessing: string;
  facePhotoTypeError: string;
  facePhotoSizeError: (mb: number) => string;
  facePhotoProcessError: string;
  facePhotoSaved: string;
  facePhotoSaveError: string;
  facePhotoSave: string;
  facePhotoSaving: string;
  facePhotoAlt: string;
}

const STRINGS: Record<EditLocale, PageStrings> = {
  hu: {
    loading: "Betöltés…",
    notFoundTitle: "Ez a link már nem érvényes",
    notFoundBody:
      "Ellenőrizd, hogy a teljes linket másoltad-e be a visszaigazoló e-mailből. Ha mégsem működik, írj nekünk:",
    editClosedTitle: "A szerkesztési időszak lezárult",
    editClosedBody:
      "A nevezési adatok önálló módosítása 2027. január 30-ig volt lehetséges. Ha mégis változtatnod kell valamin, írj nekünk:",
    heading: "Nevezési adataid",
    intro: "Itt javíthatod a nevezéskor megadott adataidat. A módosítás 2027. január 30-ig lehetséges",
    introShirtLocked: " — a pólóméret/fazon már lezárult, a rendelés leadása miatt.",
    savedAlert: "Mentve.",
    saveErrorAlert: "A mentés nem sikerült, próbáld újra.",
    lastName: "Vezetéknév",
    firstName: "Keresztnév",
    birthYear: "Születési év",
    sex: "Nem",
    selectPlaceholder: "Válassz",
    division: "Kategória",
    club: "Egyesület / Klub",
    clubHint: "Nem kötelező",
    bodyweight: "Tervezett testsúly (kg)",
    openerSquat: "Guggolás (kg)",
    openerBench: "Fekvenyomás (kg)",
    openerDeadlift: "Felhúzás (kg)",
    mcText: "Bemondó szöveg",
    notes: "Megjegyzés",
    optional: "Nem kötelező",
    shirtCut: "Póló fazon",
    shirtCutLockedHint: "A pólórendelés lezárult, ez már nem módosítható.",
    shirtSize: "Pólóméret",
    save: "Mentés",
    saving: "Mentés…",
    facePhotoTitle: "Arcfotó",
    facePhotoHint:
      "Egy tiszta, jól látható arcfotó kell ahhoz, hogy a verseny után az AI-alapú fotóválogatónk (Excire Photo) automatikusan megtalálja és összegyűjtse a rólad készült képeket.",
    facePhotoHintReplacing: " Már van feltöltött fotód — ez lecseréli.",
    facePhotoReplace: "Fotó cseréje",
    facePhotoSelect: "Fotó kiválasztása",
    facePhotoSelectAria: "Arcfotó kiválasztása",
    facePhotoProcessing: "Feldolgozás…",
    facePhotoTypeError: "Csak képfájlt tudunk elfogadni (jpg, png, heic).",
    facePhotoSizeError: (mb: number) => `A fájl túl nagy (max. ${mb} MB).`,
    facePhotoProcessError: "A fotó feldolgozása nem sikerült, próbálj egy másik képet.",
    facePhotoSaved: "Mentve.",
    facePhotoSaveError: "A mentés nem sikerült, próbáld újra.",
    facePhotoSave: "Fotó mentése",
    facePhotoSaving: "Mentés…",
    facePhotoAlt: "Feltöltött arcfotó előnézete",
  },
  en: {
    loading: "Loading…",
    notFoundTitle: "This link is no longer valid",
    notFoundBody:
      "Check that you copied the full link from your confirmation e-mail. If it still doesn't work, e-mail us:",
    editClosedTitle: "The edit window has closed",
    editClosedBody:
      "Self-service edits to your registration were possible until 30 January 2027. If you still need to change something, e-mail us:",
    heading: "Your registration details",
    intro: "You can fix the details you submitted at registration here. Edits are possible until 30 January 2027",
    introShirtLocked: " — the shirt size/cut has already locked, since the order has been placed.",
    savedAlert: "Saved.",
    saveErrorAlert: "Couldn't save, please try again.",
    lastName: "Last name",
    firstName: "First name",
    birthYear: "Birth year",
    sex: "Sex",
    selectPlaceholder: "Select",
    division: "Division",
    club: "Club / Team",
    clubHint: "Optional",
    bodyweight: "Expected bodyweight (kg)",
    openerSquat: "Squat (kg)",
    openerBench: "Bench press (kg)",
    openerDeadlift: "Deadlift (kg)",
    mcText: "Announcer text",
    notes: "Note",
    optional: "Optional",
    shirtCut: "Shirt cut",
    shirtCutLockedHint: "The shirt order has closed, this can no longer be changed.",
    shirtSize: "Shirt size",
    save: "Save",
    saving: "Saving…",
    facePhotoTitle: "Face photo",
    facePhotoHint:
      "A clear, visible face photo lets our AI photo sorter (Excire Photo) automatically find and collect your competition photos afterwards.",
    facePhotoHintReplacing: " You already have a photo uploaded — this will replace it.",
    facePhotoReplace: "Replace photo",
    facePhotoSelect: "Select photo",
    facePhotoSelectAria: "Select face photo",
    facePhotoProcessing: "Processing…",
    facePhotoTypeError: "Only image files are accepted (jpg, png, heic).",
    facePhotoSizeError: (mb: number) => `File is too large (max. ${mb} MB).`,
    facePhotoProcessError: "Couldn't process that photo, try a different one.",
    facePhotoSaved: "Saved.",
    facePhotoSaveError: "Couldn't save, please try again.",
    facePhotoSave: "Save photo",
    facePhotoSaving: "Saving…",
    facePhotoAlt: "Uploaded face photo preview",
  },
};

// The face photo stays editable (facePhotoEditOpen) even once the rest of
// the form has locked (allFieldsOpen=false) — it's optional at registration
// time and can be added right up until the event, see lib/phase.ts. Kept as
// its own small card/save so it works standalone when nothing else on the
// page is editable.
function FacePhotoCard({
  id,
  token,
  hasFacePhoto,
  t,
  onSaved,
}: {
  id: string;
  token: string;
  hasFacePhoto: boolean;
  t: PageStrings;
  onSaved: () => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const objectUrlRef = useRef<string | null>(null);

  const handleSelect = useCallback(
    async (file: File | null) => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
      if (!file) return;
      if (!file.type.startsWith("image/")) {
        setError(t.facePhotoTypeError);
        return;
      }
      if (file.size > MAX_FACE_PHOTO_MB * 1024 * 1024) {
        setError(t.facePhotoSizeError(MAX_FACE_PHOTO_MB));
        return;
      }
      setError(null);
      setProcessing(true);
      try {
        const url = await compressImageToDataUrl(file);
        setDataUrl(url);
        const preview = URL.createObjectURL(file);
        objectUrlRef.current = preview;
        setPreviewUrl(preview);
      } catch {
        setError(t.facePhotoProcessError);
      } finally {
        setProcessing(false);
      }
    },
    [t]
  );

  const save = useCallback(async () => {
    if (!dataUrl) return;
    setSaveState("saving");
    try {
      const res = await fetch(`/api/registration/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ facePhoto: dataUrl, token }),
      });
      const json = await res.json();
      setSaveState(json.ok ? "saved" : "error");
      if (json.ok) onSaved();
    } catch {
      setSaveState("error");
    }
  }, [dataUrl, id, token, onSaved]);

  return (
    <Card>
      <CardContent className="flex flex-col gap-3 p-5 sm:p-6">
        <h2 className="text-lg font-semibold">{t.facePhotoTitle}</h2>
        <p className="text-sm text-muted-foreground">
          {t.facePhotoHint}
          {hasFacePhoto && !previewUrl ? t.facePhotoHintReplacing : ""}
        </p>
        <div className="flex items-center gap-4">
          <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-background">
            {previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={previewUrl} alt={t.facePhotoAlt} className="size-full object-cover" />
            ) : (
              <Camera className="size-6 text-muted-foreground" aria-hidden="true" />
            )}
          </div>
          <div className="flex-1">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => handleSelect(e.target.files?.[0] ?? null)}
              className="sr-only"
              aria-label={t.facePhotoSelectAria}
            />
            <Button type="button" variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()}>
              {hasFacePhoto || previewUrl ? t.facePhotoReplace : t.facePhotoSelect}
            </Button>
          </div>
        </div>
        {processing && <p className="text-xs text-muted-foreground">{t.facePhotoProcessing}</p>}
        {error && (
          <p role="alert" className="flex items-center gap-1.5 text-xs font-medium text-destructive">
            <AlertCircle className="size-3.5" aria-hidden="true" />
            {error}
          </p>
        )}
        {saveState === "saved" && (
          <Alert className="flex items-center gap-2">
            <CheckCircle2 className="size-4 text-success" aria-hidden="true" />
            {t.facePhotoSaved}
          </Alert>
        )}
        {saveState === "error" && (
          <Alert className="flex items-center gap-2" variant="destructive">
            <AlertCircle className="size-4" aria-hidden="true" />
            {t.facePhotoSaveError}
          </Alert>
        )}
        {dataUrl && (
          <Button type="button" onClick={save} disabled={saveState === "saving"} className="self-start">
            {saveState === "saving" ? t.facePhotoSaving : t.facePhotoSave}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export default function EditRegistrationPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ token?: string }>;
}) {
  const { id } = use(params);
  const { token } = use(searchParams);

  const [state, setState] = useState<LoadState>({ status: "loading" });
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RegistrationEditInput>({
    resolver: zodResolver(registrationEditSchema),
  });

  useEffect(() => {
    if (!token) {
      setState({ status: "not_found" });
      return;
    }
    fetch(`/api/registration/${id}?token=${encodeURIComponent(token)}`)
      .then((res) => res.json())
      .then((json) => {
        if (!json.ok) {
          setState({ status: "not_found" });
          return;
        }
        reset(json.data);
        setState({
          status: "ready",
          locale: json.locale === "en" ? "en" : "hu",
          allFieldsOpen: json.allFieldsOpen,
          shirtOpen: json.shirtOpen,
          wantsShirt: json.data.wantsShirt,
          facePhotoEditOpen: json.facePhotoEditOpen,
          hasFacePhoto: json.hasFacePhoto,
        });
      })
      .catch(() => setState({ status: "not_found" }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, token]);

  const onSubmit = async (data: RegistrationEditInput) => {
    setSaveState("saving");
    try {
      const res = await fetch(`/api/registration/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, token }),
      });
      const json = await res.json();
      setSaveState(json.ok ? "saved" : "error");
    } catch {
      setSaveState("error");
    }
  };

  if (state.status === "loading") {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center text-muted-foreground">
        {STRINGS.hu.loading} / {STRINGS.en.loading}
      </div>
    );
  }

  if (state.status === "not_found") {
    // The locale isn't known yet (the link itself didn't resolve), so show
    // both languages rather than guessing.
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center gap-6 px-4 text-center">
        {(["hu", "en"] as const).map((locale) => {
          const t = STRINGS[locale];
          return (
            <div key={locale} className="flex flex-col items-center gap-3">
              <AlertCircle className="size-10 text-destructive" aria-hidden="true" />
              <h1 className="text-2xl">{t.notFoundTitle}</h1>
              <p className="text-sm text-muted-foreground">
                {t.notFoundBody}{" "}
                <a href={`mailto:${EVENT.contact.email}`} className="text-primary">
                  {EVENT.contact.email}
                </a>
              </p>
            </div>
          );
        })}
      </div>
    );
  }

  const t = STRINGS[state.locale];
  const sexLabels = SEX_LABELS[state.locale];
  const divisionLabels = DIVISION_LABELS[state.locale];
  const shirtCutLabels = SHIRT_CUT_LABELS[state.locale];

  if (!state.allFieldsOpen) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16">
        <div className="mb-8 flex flex-col items-center gap-4 text-center">
          <Lock className="size-10 text-muted-foreground" aria-hidden="true" />
          <h1 className="text-2xl">{t.editClosedTitle}</h1>
          <p className="text-sm text-muted-foreground">
            {t.editClosedBody}{" "}
            <a href={`mailto:${EVENT.contact.email}`} className="text-primary">
              {EVENT.contact.email}
            </a>
          </p>
        </div>
        {state.facePhotoEditOpen && (
          <FacePhotoCard
            id={id}
            token={token ?? ""}
            hasFacePhoto={state.hasFacePhoto}
            t={t}
            onSaved={() => setState({ ...state, hasFacePhoto: true })}
          />
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-8">
      <div className="eyebrow mb-1">SBD Next 2</div>
      <h1 className="mb-1 text-3xl">{t.heading}</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        {t.intro}
        {state.wantsShirt && !state.shirtOpen ? t.introShirtLocked : "."}
      </p>

      {state.facePhotoEditOpen && (
        <div className="mb-6">
          <FacePhotoCard
            id={id}
            token={token ?? ""}
            hasFacePhoto={state.hasFacePhoto}
            t={t}
            onSaved={() => setState({ ...state, hasFacePhoto: true })}
          />
        </div>
      )}

      {saveState === "saved" && (
        <Alert className="mb-5 flex items-center gap-2">
          <CheckCircle2 className="size-4 text-success" aria-hidden="true" />
          {t.savedAlert}
        </Alert>
      )}
      {saveState === "error" && (
        <Alert className="mb-5 flex items-center gap-2" variant="destructive">
          <AlertCircle className="size-4" aria-hidden="true" />
          {t.saveErrorAlert}
        </Alert>
      )}

      <Card>
        <CardContent className="p-5 sm:p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <Controller
                name="lastName"
                control={control}
                render={({ field }) => (
                  <Field id="lastName" label={t.lastName} required error={errors.lastName?.message}>
                    <Input id="lastName" {...field} />
                  </Field>
                )}
              />
              <Controller
                name="firstName"
                control={control}
                render={({ field }) => (
                  <Field id="firstName" label={t.firstName} required error={errors.firstName?.message}>
                    <Input id="firstName" {...field} />
                  </Field>
                )}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Controller
                name="birthYear"
                control={control}
                render={({ field }) => (
                  <Field id="birthYear" label={t.birthYear} required error={errors.birthYear?.message}>
                    <Input id="birthYear" inputMode="numeric" maxLength={4} {...field} />
                  </Field>
                )}
              />
              <Controller
                name="sex"
                control={control}
                render={({ field }) => (
                  <Field id="sex" label={t.sex} required error={errors.sex?.message}>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="sex">
                        <SelectValue placeholder={t.selectPlaceholder} />
                      </SelectTrigger>
                      <SelectContent>
                        {EVENT.sexes.map((s) => (
                          <SelectItem key={s} value={s}>
                            {sexLabels[s] ?? s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                )}
              />
            </div>

            <Controller
              name="division"
              control={control}
              render={({ field }) => (
                <Field id="division" label={t.division} required error={errors.division?.message}>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="division">
                      <SelectValue placeholder={t.selectPlaceholder} />
                    </SelectTrigger>
                    <SelectContent>
                      {EVENT.divisions.map((d) => (
                        <SelectItem key={d} value={d}>
                          {divisionLabels[d] ?? d}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              )}
            />

            <Controller
              name="club"
              control={control}
              render={({ field }) => (
                <Field id="club" label={t.club} hint={t.clubHint}>
                  <Input id="club" {...field} />
                </Field>
              )}
            />

            <Controller
              name="bodyweight"
              control={control}
              render={({ field }) => (
                <Field id="bodyweight" label={t.bodyweight} required error={errors.bodyweight?.message}>
                  <Input id="bodyweight" inputMode="decimal" {...field} />
                </Field>
              )}
            />

            <div className="grid gap-4 sm:grid-cols-3">
              <Controller
                name="openerSquat"
                control={control}
                render={({ field }) => (
                  <Field id="openerSquat" label={t.openerSquat} error={errors.openerSquat?.message}>
                    <Input id="openerSquat" inputMode="decimal" {...field} />
                  </Field>
                )}
              />
              <Controller
                name="openerBench"
                control={control}
                render={({ field }) => (
                  <Field id="openerBench" label={t.openerBench} error={errors.openerBench?.message}>
                    <Input id="openerBench" inputMode="decimal" {...field} />
                  </Field>
                )}
              />
              <Controller
                name="openerDeadlift"
                control={control}
                render={({ field }) => (
                  <Field id="openerDeadlift" label={t.openerDeadlift} error={errors.openerDeadlift?.message}>
                    <Input id="openerDeadlift" inputMode="decimal" {...field} />
                  </Field>
                )}
              />
            </div>

            <Controller
              name="mcText"
              control={control}
              render={({ field }) => (
                <Field id="mcText" label={t.mcText} hint={t.optional}>
                  <Textarea id="mcText" {...field} />
                </Field>
              )}
            />

            <Controller
              name="notes"
              control={control}
              render={({ field }) => (
                <Field id="notes" label={t.notes} hint={t.optional}>
                  <Textarea id="notes" {...field} />
                </Field>
              )}
            />

            {state.wantsShirt && (
              <div className="grid gap-4 sm:grid-cols-2">
                <Controller
                  name="shirtCut"
                  control={control}
                  render={({ field }) => (
                    <Field id="shirtCut" label={t.shirtCut} hint={!state.shirtOpen ? t.shirtCutLockedHint : undefined}>
                      <Select value={field.value} onValueChange={field.onChange} disabled={!state.shirtOpen}>
                        <SelectTrigger id="shirtCut">
                          <SelectValue placeholder={t.selectPlaceholder} />
                        </SelectTrigger>
                        <SelectContent>
                          {EVENT.shirt.cuts.map((c) => (
                            <SelectItem key={c} value={c}>
                              {shirtCutLabels[c] ?? c}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                  )}
                />
                <Controller
                  name="shirtSize"
                  control={control}
                  render={({ field }) => (
                    <Field id="shirtSize" label={t.shirtSize}>
                      <Select value={field.value} onValueChange={field.onChange} disabled={!state.shirtOpen}>
                        <SelectTrigger id="shirtSize">
                          <SelectValue placeholder={t.selectPlaceholder} />
                        </SelectTrigger>
                        <SelectContent>
                          {EVENT.shirt.sizes.map((s) => (
                            <SelectItem key={s} value={s}>
                              {s}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                  )}
                />
              </div>
            )}

            <Button type="submit" disabled={saveState === "saving"} className="self-start">
              {saveState === "saving" ? t.saving : t.save}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
