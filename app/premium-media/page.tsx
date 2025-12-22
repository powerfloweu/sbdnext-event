"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Camera, AlertCircle, CheckCircle2, Mail, ArrowLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

// Csak reg-staging környezetben érhető el
const IS_STAGING = process.env.NEXT_PUBLIC_ENV === "reg-staging";

const PREMIUM_MEDIA_PRICE = 24990;
const PREMIUM_PAYMENT_LINK = "https://buy.stripe.com/3cIdRabMbfhkeUb6IT1ck03";

interface FormData {
  email: string;
  honeypot: string;
}

export default function PremiumMediaPage() {
  const [data, setData] = useState<FormData>({
    email: "",
    honeypot: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  // Ha nem staging, akkor hibaüzenetet jelenítünk meg
  if (!IS_STAGING) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-black via-neutral-950 to-neutral-900">
        <div className="pointer-events-none absolute inset-0">
          <div
            className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-red-500/30 blur-[120px]"
            style={{ transform: "translate(-50%, -50%)" }}
          />
          <div
            className="absolute right-1/4 bottom-1/4 h-96 w-96 rounded-full bg-red-600/20 blur-[100px]"
            style={{ transform: "translate(50%, 50%)" }}
          />
        </div>

        <div className="relative z-10 mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="rounded-2xl border border-red-900/50 bg-black/60 backdrop-blur-sm">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 text-red-400">
                  <AlertCircle className="h-6 w-6" />
                  <h1 className="text-xl font-bold">Oldal nem elérhető</h1>
                </div>
                <p className="mt-4 text-neutral-300">
                  Ez az oldal jelenleg csak staging környezetben érhető el.
                </p>
                <Link href="/">
                  <Button className="mt-6 rounded-full bg-red-600 hover:bg-red-700">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Vissza a főoldalra
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    // Honeypot check
    if (data.honeypot.trim().length > 0) return;

    // Validáció
    if (!data.email.trim() || !/.+@.+\..+/.test(data.email)) {
      setError("Kérlek valós e-mail címet adj meg.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // Átirányítás Stripe-ra
      const url = new URL(PREMIUM_PAYMENT_LINK);
      if (data.email) {
        url.searchParams.set("prefilled_email", data.email);
      }
      
      window.location.href = url.toString();
      setDone(true);
    } catch {
      setError("A vásárlás nem sikerült. Próbáld újra, vagy írj nekünk e-mailt.");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-black via-neutral-950 to-neutral-900">
        <div className="pointer-events-none absolute inset-0">
          <div
            className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-red-500/30 blur-[120px]"
            style={{ transform: "translate(-50%, -50%)" }}
          />
        </div>

        <div className="relative z-10 mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="rounded-2xl border border-green-500/40 bg-green-950/40 backdrop-blur-sm">
              <CardContent className="p-8 text-center">
                <CheckCircle2 className="mx-auto h-12 w-12 text-green-400" />
                <h3 className="mt-4 text-xl font-semibold text-green-100">
                  Átirányítás a fizetéshez…
                </h3>
                <p className="mt-2 text-sm text-green-100/80">
                  Hamarosan átirányítunk a Stripe fizetési oldalra.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-black via-neutral-950 to-neutral-900">
      {/* Háttér effektek */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-red-500/30 blur-[120px]"
          style={{ transform: "translate(-50%, -50%)" }}
        />
        <div
          className="absolute right-1/4 bottom-1/4 h-96 w-96 rounded-full bg-red-600/20 blur-[100px]"
          style={{ transform: "translate(50%, 50%)" }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-16 lg:px-8">
        {/* Fejléc */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <Link href="/">
            <Button
              variant="ghost"
              className="mb-6 text-red-400 hover:text-red-300"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Vissza a főoldalra
            </Button>
          </Link>

          <div className="flex items-center gap-3 mb-4">
            <Camera className="h-8 w-8 text-red-500" />
            <h1 className="text-3xl font-bold text-neutral-100 sm:text-4xl">
              Prémium Média Csomag
            </h1>
          </div>
          
          <p className="text-neutral-300">
            Utólagos vásárlás sportolóknak, akik már neveztek az SBD Next versenyre.
          </p>
        </motion.div>

        {/* Infó kártya */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="mb-8 rounded-2xl border border-red-900/50 bg-black/60 backdrop-blur-sm">
            <CardContent className="p-6">
              <h3 className="mb-3 text-lg font-semibold text-red-400">
                Mit tartalmaz a csomag?
              </h3>
              <ul className="space-y-2 text-sm text-neutral-300">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-400" />
                  <span>
                    <b>3 professzionális fotó</b> a versenyedről, kiemelt válogatással
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-400" />
                  <span>
                    <b>3 minőségi videó</b> a legjobb próbálkozásaidról
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-400" />
                  <span>
                    4 fős profi média csapat gondoskodik a tartalmakról
                  </span>
                </li>
              </ul>
              
              <div className="mt-6 rounded-xl border border-red-500/30 bg-red-950/30 p-4">
                <div className="flex items-baseline justify-between">
                  <span className="text-sm text-red-300">Ár:</span>
                  <span className="text-2xl font-bold text-red-400">
                    {new Intl.NumberFormat("hu-HU").format(PREMIUM_MEDIA_PRICE)} Ft
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Vásárlási űrlap */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="rounded-2xl border border-neutral-800 bg-black/70 backdrop-blur-sm">
            <CardContent className="p-6 sm:p-8">
              <h2 className="mb-2 text-xl font-semibold text-neutral-100">Vásárlási adatok</h2>
              <p className="mb-6 text-sm text-neutral-400">Add meg az e-mail címedet (lehetőleg a nevezéskor használt e-mail címet).</p>

              <form onSubmit={handleSubmit} noValidate className="space-y-4">
                {error && (
                  <div className="flex items-center gap-2 rounded-lg border border-red-500/50 bg-red-950/30 p-3 text-sm text-red-400">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    {error}
                  </div>
                )}

                {/* Honeypot */}
                <div className="hidden" aria-hidden="true">
                  <label>Ne töltsd ki ezt a mezőt</label>
                  <Input
                    tabIndex={-1}
                    autoComplete="off"
                    value={data.honeypot}
                    onChange={(e) => setData({ ...data, honeypot: e.target.value })}
                  />
                </div>

                {/* E-mail cím */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-red-400">
                    E-mail cím <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="email"
                    value={data.email}
                    onChange={(e) => setData({ ...data, email: e.target.value })}
                    placeholder="pelda@email.hu"
                    className="border-red-500/50"
                    required
                  />
                </div>

                {/* Info box */}
                <div className="rounded-lg border border-blue-500/30 bg-blue-950/20 p-4">
                  <div className="flex gap-3">
                    <Mail className="h-5 w-5 flex-shrink-0 text-blue-400" />
                    <div className="text-sm text-neutral-300">
                      <p className="mb-1 font-semibold text-blue-300">
                        Fontos tudnivaló:
                      </p>
                      <p>
                        A fizetés után visszaigazoló e-mailt küldünk. A fotókat és
                        videókat a verseny után legkésőbb 96 órán belül kapod meg e-mailben.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Gomb */}
                <div className="pt-4">
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="h-12 w-full rounded-full bg-gradient-to-r from-red-700 via-red-500 to-red-400 text-base font-bold shadow-[0_0_40px_rgba(248,113,113,0.8)] hover:from-red-600 hover:via-red-500 hover:to-red-300 sm:h-14 sm:text-lg"
                  >
                    {submitting ? (
                      "Tovább a fizetéshez…"
                    ) : (
                      <>
                        Tovább a fizetéshez
                        <ArrowLeft className="ml-2 h-5 w-5 rotate-180" />
                      </>
                    )}
                  </Button>
                  <p className="mt-3 text-center text-xs text-neutral-400">
                    A fizetés biztonságos Stripe rendszeren keresztül történik.
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        {/* Kapcsolat */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-8 text-center"
        >
          <p className="text-sm text-neutral-400">
            Kérdésed van?{" "}
            <a
              href="mailto:powerlifting@sbdnext.hu"
              className="text-red-400 hover:text-red-300 underline"
            >
              powerlifting@sbdnext.hu
            </a>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
