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

type LoadState =
  | { status: "loading" }
  | { status: "not_found" }
  | {
      status: "ready";
      allFieldsOpen: boolean;
      shirtOpen: boolean;
      wantsShirt: boolean;
      facePhotoEditOpen: boolean;
      hasFacePhoto: boolean;
    };

const MAX_FACE_PHOTO_MB = 20;

// The face photo stays editable (facePhotoEditOpen) even once the rest of
// the form has locked (allFieldsOpen=false) — it's optional at registration
// time and can be added right up until the event, see lib/phase.ts. Kept as
// its own small card/save so it works standalone when nothing else on the
// page is editable.
function FacePhotoCard({
  id,
  token,
  hasFacePhoto,
  onSaved,
}: {
  id: string;
  token: string;
  hasFacePhoto: boolean;
  onSaved: () => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const objectUrlRef = useRef<string | null>(null);

  const handleSelect = useCallback(async (file: File | null) => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Csak képfájlt tudunk elfogadni (jpg, png, heic).");
      return;
    }
    if (file.size > MAX_FACE_PHOTO_MB * 1024 * 1024) {
      setError(`A fájl túl nagy (max. ${MAX_FACE_PHOTO_MB} MB).`);
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
      setError("A fotó feldolgozása nem sikerült, próbálj egy másik képet.");
    } finally {
      setProcessing(false);
    }
  }, []);

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
        <h2 className="text-lg font-semibold">Arcfotó</h2>
        <p className="text-sm text-muted-foreground">
          Egy tiszta, jól látható arcfotó kell ahhoz, hogy a verseny után az AI-alapú
          fotóválogatónk (Excire Photo) automatikusan megtalálja és összegyűjtse a rólad készült
          képeket. {hasFacePhoto && !previewUrl ? "Már van feltöltött fotód — ez lecseréli." : ""}
        </p>
        <div className="flex items-center gap-4">
          <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-background">
            {previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={previewUrl} alt="Feltöltött arcfotó előnézete" className="size-full object-cover" />
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
              aria-label="Arcfotó kiválasztása"
            />
            <Button type="button" variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()}>
              {hasFacePhoto || previewUrl ? "Fotó cseréje" : "Fotó kiválasztása"}
            </Button>
          </div>
        </div>
        {processing && <p className="text-xs text-muted-foreground">Feldolgozás…</p>}
        {error && (
          <p role="alert" className="flex items-center gap-1.5 text-xs font-medium text-destructive">
            <AlertCircle className="size-3.5" aria-hidden="true" />
            {error}
          </p>
        )}
        {saveState === "saved" && (
          <Alert className="flex items-center gap-2">
            <CheckCircle2 className="size-4 text-success" aria-hidden="true" />
            Mentve.
          </Alert>
        )}
        {saveState === "error" && (
          <Alert className="flex items-center gap-2" variant="destructive">
            <AlertCircle className="size-4" aria-hidden="true" />
            A mentés nem sikerült, próbáld újra.
          </Alert>
        )}
        {dataUrl && (
          <Button type="button" onClick={save} disabled={saveState === "saving"} className="self-start">
            {saveState === "saving" ? "Mentés…" : "Fotó mentése"}
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
      <div className="mx-auto max-w-2xl px-4 py-16 text-center text-muted-foreground">Betöltés…</div>
    );
  }

  if (state.status === "not_found") {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center gap-4 px-4 text-center">
        <AlertCircle className="size-10 text-destructive" aria-hidden="true" />
        <h1 className="text-2xl">Ez a link már nem érvényes</h1>
        <p className="text-sm text-muted-foreground">
          Ellenőrizd, hogy a teljes linket másoltad-e be a visszaigazoló e-mailből. Ha mégsem működik,
          írj nekünk: <a href={`mailto:${EVENT.contact.email}`} className="text-primary">{EVENT.contact.email}</a>
        </p>
      </div>
    );
  }

  if (!state.allFieldsOpen) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16">
        <div className="mb-8 flex flex-col items-center gap-4 text-center">
          <Lock className="size-10 text-muted-foreground" aria-hidden="true" />
          <h1 className="text-2xl">A szerkesztési időszak lezárult</h1>
          <p className="text-sm text-muted-foreground">
            A nevezési adatok önálló módosítása 2027. január 30-ig volt lehetséges. Ha mégis változtatnod
            kell valamin, írj nekünk: <a href={`mailto:${EVENT.contact.email}`} className="text-primary">{EVENT.contact.email}</a>
          </p>
        </div>
        {state.facePhotoEditOpen && (
          <FacePhotoCard
            id={id}
            token={token ?? ""}
            hasFacePhoto={state.hasFacePhoto}
            onSaved={() => setState({ ...state, hasFacePhoto: true })}
          />
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-8">
      <div className="eyebrow mb-1">SBD Next 2</div>
      <h1 className="mb-1 text-3xl">Nevezési adataid</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Itt javíthatod a nevezéskor megadott adataidat. A módosítás 2027. január 30-ig lehetséges
        {state.wantsShirt && !state.shirtOpen ? " — a pólóméret/fazon már lezárult, a rendelés leadása miatt." : "."}
      </p>

      {state.facePhotoEditOpen && (
        <div className="mb-6">
          <FacePhotoCard
            id={id}
            token={token ?? ""}
            hasFacePhoto={state.hasFacePhoto}
            onSaved={() => setState({ ...state, hasFacePhoto: true })}
          />
        </div>
      )}

      {saveState === "saved" && (
        <Alert className="mb-5 flex items-center gap-2">
          <CheckCircle2 className="size-4 text-success" aria-hidden="true" />
          Mentve.
        </Alert>
      )}
      {saveState === "error" && (
        <Alert className="mb-5 flex items-center gap-2" variant="destructive">
          <AlertCircle className="size-4" aria-hidden="true" />
          A mentés nem sikerült, próbáld újra.
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
                  <Field id="lastName" label="Vezetéknév" required error={errors.lastName?.message}>
                    <Input id="lastName" {...field} />
                  </Field>
                )}
              />
              <Controller
                name="firstName"
                control={control}
                render={({ field }) => (
                  <Field id="firstName" label="Keresztnév" required error={errors.firstName?.message}>
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
                  <Field id="birthYear" label="Születési év" required error={errors.birthYear?.message}>
                    <Input id="birthYear" inputMode="numeric" maxLength={4} {...field} />
                  </Field>
                )}
              />
              <Controller
                name="sex"
                control={control}
                render={({ field }) => (
                  <Field id="sex" label="Nem" required error={errors.sex?.message}>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="sex">
                        <SelectValue placeholder="Válassz" />
                      </SelectTrigger>
                      <SelectContent>
                        {EVENT.sexes.map((s) => (
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

            <Controller
              name="division"
              control={control}
              render={({ field }) => (
                <Field id="division" label="Kategória" required error={errors.division?.message}>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="division">
                      <SelectValue placeholder="Válassz" />
                    </SelectTrigger>
                    <SelectContent>
                      {EVENT.divisions.map((d) => (
                        <SelectItem key={d} value={d}>
                          {d}
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
                <Field id="club" label="Egyesület / Klub" hint="Nem kötelező">
                  <Input id="club" {...field} />
                </Field>
              )}
            />

            <Controller
              name="bodyweight"
              control={control}
              render={({ field }) => (
                <Field id="bodyweight" label="Tervezett testsúly (kg)" required error={errors.bodyweight?.message}>
                  <Input id="bodyweight" inputMode="decimal" {...field} />
                </Field>
              )}
            />

            <div className="grid gap-4 sm:grid-cols-3">
              <Controller
                name="openerSquat"
                control={control}
                render={({ field }) => (
                  <Field id="openerSquat" label="Guggolás (kg)" error={errors.openerSquat?.message}>
                    <Input id="openerSquat" inputMode="decimal" {...field} />
                  </Field>
                )}
              />
              <Controller
                name="openerBench"
                control={control}
                render={({ field }) => (
                  <Field id="openerBench" label="Fekvenyomás (kg)" error={errors.openerBench?.message}>
                    <Input id="openerBench" inputMode="decimal" {...field} />
                  </Field>
                )}
              />
              <Controller
                name="openerDeadlift"
                control={control}
                render={({ field }) => (
                  <Field id="openerDeadlift" label="Felhúzás (kg)" error={errors.openerDeadlift?.message}>
                    <Input id="openerDeadlift" inputMode="decimal" {...field} />
                  </Field>
                )}
              />
            </div>

            <Controller
              name="mcText"
              control={control}
              render={({ field }) => (
                <Field id="mcText" label="Bemondó szöveg" hint="Nem kötelező">
                  <Textarea id="mcText" {...field} />
                </Field>
              )}
            />

            <Controller
              name="notes"
              control={control}
              render={({ field }) => (
                <Field id="notes" label="Megjegyzés" hint="Nem kötelező">
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
                    <Field
                      id="shirtCut"
                      label="Póló fazon"
                      hint={!state.shirtOpen ? "A pólórendelés lezárult, ez már nem módosítható." : undefined}
                    >
                      <Select value={field.value} onValueChange={field.onChange} disabled={!state.shirtOpen}>
                        <SelectTrigger id="shirtCut">
                          <SelectValue placeholder="Válassz" />
                        </SelectTrigger>
                        <SelectContent>
                          {EVENT.shirt.cuts.map((c) => (
                            <SelectItem key={c} value={c}>
                              {c}
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
                    <Field id="shirtSize" label="Pólóméret">
                      <Select value={field.value} onValueChange={field.onChange} disabled={!state.shirtOpen}>
                        <SelectTrigger id="shirtSize">
                          <SelectValue placeholder="Válassz" />
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
              {saveState === "saving" ? "Mentés…" : "Mentés"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
