"use client";

import { useEffect, useState } from "react";

import { statoApertura, type OrariSettimanali } from "@/lib/orari";

/**
 * Pallino "Aperto ora / Chiuso" calcolato sull'ora di Bologna.
 * Compare solo dopo il caricamento nel browser, perché dipende dall'orario
 * in cui si guarda la pagina e non da quando è stata generata.
 */
export default function ApertoOra({
  orari,
  className = "",
  testata = false,
}: {
  orari?: OrariSettimanali | null;
  className?: string;
  /**
   * Nella testata lo spazio è poco: dove non ci sta la frase intera (telefoni
   * stretti e schermi medi) resta solo "Aperto" / "Chiuso".
   */
  testata?: boolean;
}) {
  const [stato, setStato] = useState<ReturnType<typeof statoApertura> | null>(
    null
  );

  useEffect(() => {
    const aggiorna = () => setStato(statoApertura(orari));
    aggiorna();
    const timer = setInterval(aggiorna, 60_000);
    return () => clearInterval(timer);
  }, [orari]);

  if (!stato) return null;

  const frase = stato.aperto
    ? `Aperto ora · fino alle ${stato.finoAlle}`
    : stato.riapreAlle
      ? `Chiuso · riapre alle ${stato.riapreAlle}`
      : "Chiuso in questo momento";

  return (
    <span
      title={testata ? frase : undefined}
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-extrabold ${
        stato.aperto
          ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
          : "bg-slate-100 text-slate-600 border border-slate-200"
      } ${className}`}
    >
      <span
        aria-hidden
        className={`w-2 h-2 rounded-full ${
          stato.aperto ? "bg-emerald-500" : "bg-slate-400"
        }`}
      />
      {testata ? (
        <>
          <span className="hidden sm:inline xl:hidden 2xl:inline">{frase}</span>
          <span className="sm:hidden xl:inline 2xl:hidden" aria-hidden>
            {stato.aperto ? "Aperto" : "Chiuso"}
          </span>
          <span className="sr-only sm:hidden xl:block 2xl:hidden">{frase}</span>
        </>
      ) : (
        frase
      )}
    </span>
  );
}
