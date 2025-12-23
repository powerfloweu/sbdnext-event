"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
export default function PremiumMediaPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-black via-neutral-950 to-neutral-900">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-red-500/30 blur-[120px]" style={{ transform: "translate(-50%, -50%)" }} />
        <div className="absolute right-1/4 bottom-1/4 h-96 w-96 rounded-full bg-red-600/20 blur-[100px]" style={{ transform: "translate(50%, 50%)" }} />
      </div>
      <div className="relative z-10 mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Card className="rounded-2xl border border-red-900/50 bg-black/60 backdrop-blur-sm">
            <CardContent className="p-8">
              <h1 className="mb-6 text-3xl font-bold text-red-400">A versenyed napja. Dokumentálva.</h1>
              <p className="mb-4 text-neutral-200">
                Az SBD Next napján sok minden történik egyszerre.<br />
                A bemelegítés ritmusa, a ráhangolódás, ahogy bemagnéziázod a kezedet, becsattintod az övedet, majd kilépsz a platformra.<br />
                Ezután kilenc egyperces szakasz következik, amely teljes egészében a tiéd.<br /><br />
                A Premium Media Package célja, hogy ez a nap az egyik legerősebb emlékként maradjon meg számodra.
              </p>
              <h2 className="mt-8 mb-3 text-xl font-semibold text-red-300">Mit tartalmaz a csomag?</h2>
              <ul className="mb-6 space-y-2 text-neutral-100">
                <li>› Minden attemptről rögzített videó – stabil, fix kamerás felvétel.</li>
                <li>› Extra mozgókamerás highlight videó (max. 10 mp): bemelegítés, eq check, mentális felkészülés.</li>
                <li>› Több, gondosan válogatott fotó a verseny teljes ívéről.</li>
                <li>› Gyors átadás – az esemény után legfeljebb 96 órán belül.</li>
              </ul>
              <p className="mb-6 text-neutral-300">
                Ez az anyag nem kizárólag megosztásra készül.<br />
                Használható edzői visszajelzéshez, mentális feldolgozáshoz, valamint a következő felkészülési ciklus alapjaként is.
              </p>
              <h2 className="mt-8 mb-3 text-xl font-semibold text-red-300">A stáb, akik készítik</h2>
              <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <h3 className="font-bold text-neutral-100">Fotósok:</h3>
                  <div className="flex items-center gap-3 mt-2">
                    <img
                      src="/kata.jpg"
                      alt="Hunyás Kata profilképe"
                      className="h-12 w-12 rounded-full object-cover bg-neutral-800 border-2 border-red-400"
                      onError={e => { e.currentTarget.src = '/sbd_logo.jpg'; }}
                    />
                    <div>
                      Hunyás Kata<br />
                      <a href="https://instagram.com/visualsofkata" target="_blank" rel="noopener noreferrer" className="text-xs text-red-400 hover:underline">@visualsofkata</a>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mt-2">
                    <img
                      src="/bence.jpg"
                      alt="Lantos Bence profilképe"
                      className="h-12 w-12 rounded-full object-cover bg-neutral-800 border-2 border-red-400"
                      onError={e => { e.currentTarget.src = '/sbd_logo.jpg'; }}
                    />
                    <div>
                      Lantos Bence<br />
                      <a href="https://instagram.com/bencelantos" target="_blank" rel="noopener noreferrer" className="text-xs text-red-400 hover:underline">@bencelantos</a>
                    </div>
                  </div>
                  <div className="mt-4">
                    <a href="https://instagram.com/visualsofkata" target="_blank" rel="noopener noreferrer">
                      <Button className="w-full bg-blue-900/60 hover:bg-blue-800/80 text-blue-200 mt-2">Nézz szét a munkáik között!</Button>
                    </a>
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-neutral-100">Videósok:</h3>
                  <div className="flex items-center gap-3 mt-2">
                    <img
                      src="/mark.jpg"
                      alt="Lakatos Márk profilképe"
                      className="h-12 w-12 rounded-full object-cover bg-neutral-800 border-2 border-red-400"
                      onError={e => { e.currentTarget.src = '/sbd_logo.jpg'; }}
                    />
                    <div>
                      Lakatos Márk<br />
                      <a href="https://instagram.com/mark_g_l_" target="_blank" rel="noopener noreferrer" className="text-xs text-red-400 hover:underline">@mark_g_l_</a>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mt-2">
                    <img
                      src="/akos.jpg"
                      alt="Schwalm Ákos profilképe"
                      className="h-12 w-12 rounded-full object-cover bg-neutral-800 border-2 border-red-400"
                      onError={e => { e.currentTarget.src = '/sbd_logo.jpg'; }}
                    />
                    <div>
                      Schwalm Ákos<br />
                      <a href="https://instagram.com/akos.schwalm" target="_blank" rel="noopener noreferrer" className="text-xs text-red-400 hover:underline">@akos.schwalm</a>
                    </div>
                  </div>
                  <div className="mt-4">
                    <a href="https://instagram.com/mark_g_l_" target="_blank" rel="noopener noreferrer">
                      <Button className="w-full bg-blue-900/60 hover:bg-blue-800/80 text-blue-200 mt-2">Nézz szét a munkáik között!</Button>
                    </a>
                  </div>
                </div>
              </div>
              <p className="mb-6 text-neutral-300">
                A cél nem pusztán a látvány.<br />
                A cél az, hogy az adott pillanat pontosan és profi módon legyen rögzítve.
              </p>
              <div className="mb-6 rounded-xl border border-red-500/30 bg-red-950/30 p-4">
                <span className="block text-sm text-red-300 mb-2 font-semibold">Fontos tudnivaló</span>
                <span className="block text-neutral-100">A Premium Media Package limitált számban érhető el a stáb kapacitása miatt.</span>
              </div>
              <a href="https://buy.stripe.com/3cIdRabMbfhkeUb6IT1ck03" target="_blank" rel="noopener noreferrer">
                <Button className="h-12 w-full rounded-full bg-gradient-to-r from-red-700 via-red-500 to-red-400 text-white text-base font-bold shadow-[0_0_40px_rgba(248,113,113,0.8)] hover:from-red-600 hover:via-red-500 hover:to-red-300 sm:h-14 sm:text-lg mb-4">
                  Biztosítsd a helyedet még ma
                </Button>
              </a>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
