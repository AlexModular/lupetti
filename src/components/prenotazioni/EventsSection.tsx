"use client";

import { Calendar, CalendarCheck, Users, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import SanityImage from "@/components/SanityImage";
import { formattaEvento } from "@/lib/orari";
import type { DisponibilitaEvento, EsitoPrenotazione, Evento } from "@/types";

import ModuloFamiglia, { PrenotazioneRiuscita } from "./ModuloFamiglia";

interface EventsSectionProps {
  eventi: Evento[];
  maxBambini: number;
  privacyHref?: string | null;
}

/**
 * Schede dei laboratori/eventi con i posti rimasti (letti dal server ad ogni
 * visita) e la finestra per prenotare.
 */
export default function EventsSection({
  eventi,
  maxBambini,
  privacyHref,
}: EventsSectionProps) {
  const [posti, setPosti] = useState<Record<string, DisponibilitaEvento>>({});
  const [adesso, setAdesso] = useState<number | null>(null);
  const [scelto, setScelto] = useState<Evento | null>(null);
  const [esito, setEsito] = useState<EsitoPrenotazione | null>(null);

  const caricaPosti = useCallback(async () => {
    try {
      const res = await fetch("/api/prenotazioni/eventi", { cache: "no-store" });
      if (!res.ok) return;
      const dati: { disponibilita?: DisponibilitaEvento[] } = await res.json();
      setPosti(
        Object.fromEntries((dati.disponibilita ?? []).map((d) => [d.id, d]))
      );
    } catch {
      // Senza rete restano visibili le schede, senza il conteggio dei posti.
    }
  }, []);

  useEffect(() => {
    setAdesso(Date.now());
    caricaPosti();
  }, [caricaPosti]);

  const chiudi = useCallback(() => {
    setScelto(null);
    setEsito(null);
  }, []);

  // Con la finestra aperta: Esc per chiudere e pagina sotto bloccata.
  useEffect(() => {
    if (!scelto) return;
    const suTasto = (e: KeyboardEvent) => e.key === "Escape" && chiudi();
    document.addEventListener("keydown", suTasto);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", suTasto);
      document.body.style.overflow = overflow;
    };
  }, [scelto, chiudi]);

  // Gli eventi già finiti spariscono anche se la pagina è stata generata prima.
  const visibili = eventi.filter(
    (e) => !adesso || !e.fine || new Date(e.fine).getTime() > adesso
  );

  if (visibili.length === 0) {
    return (
      <p className="rounded-md border border-dashed border-lupetti-teal/30 bg-white p-8 text-center text-slate-600">
        Al momento non ci sono laboratori in programma. Torna a trovarci presto!
      </p>
    );
  }

  const postiScelto = scelto ? posti[scelto._id] : undefined;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
        {visibili.map((evento) => {
          const info = posti[evento._id];
          const capienza = info?.capienza ?? evento.capienza ?? 10;
          const prenotati = info?.prenotati ?? 0;
          const rimasti = info?.rimasti ?? capienza;
          const prenotabile = evento.prenotabile !== false;
          const iniziato =
            Boolean(adesso && evento.inizio) &&
            new Date(evento.inizio as string).getTime() <= (adesso as number);
          const chiuso = info ? !info.aperto : iniziato;
          const esaurito = prenotabile && rimasti <= 0;
          const percentuale = Math.min(
            100,
            Math.round((prenotati / Math.max(1, capienza)) * 100)
          );

          return (
            <article
              key={evento._id}
              className="bg-white rounded-md border border-lupetti-teal/20 shadow-card overflow-hidden flex flex-col justify-between"
            >
              <div>
                <div className="relative h-48 bg-gradient-to-br from-lupetti-tealLight to-lupetti-skyLight overflow-hidden">
                  <SanityImage
                    image={evento.immagine}
                    alt=""
                    width={720}
                    aspect={720 / 290}
                    sizes="(min-width: 768px) 560px, 100vw"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 flex flex-wrap items-center gap-2">
                    {evento.categoria && (
                      <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-white/95 text-lupetti-tealDark shadow-sm">
                        {evento.categoria}
                      </span>
                    )}
                    {evento.prezzo && (
                      <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-lupetti-skyDark text-white shadow-sm">
                        {evento.prezzo}
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-slate-700 mb-2.5">
                    <span className="inline-flex items-center gap-1.5 text-lupetti-tealDark bg-lupetti-tealLight px-3 py-1 rounded-full">
                      <Calendar className="w-3.5 h-3.5" aria-hidden />
                      {formattaEvento(evento.inizio, evento.fine)}
                    </span>
                    {evento.fasciaEta && (
                      <span className="inline-flex items-center gap-1 bg-slate-100 px-2.5 py-1 rounded-full">
                        <Users className="w-3.5 h-3.5 text-lupetti-skyDark" aria-hidden />
                        {evento.fasciaEta}
                      </span>
                    )}
                  </div>

                  <h3 className="font-display text-xl font-bold text-slate-800">
                    {evento.title}
                  </h3>
                  {evento.descrizione && (
                    <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                      {evento.descrizione}
                    </p>
                  )}
                </div>
              </div>

              {prenotabile ? (
                <div className="px-6 pb-6 pt-3 border-t border-slate-100 space-y-3.5">
                  <div>
                    <div className="flex items-center justify-between text-xs font-extrabold mb-1.5">
                      <span
                        className={
                          esaurito
                            ? "text-rose-700"
                            : rimasti <= 3
                              ? "text-amber-700"
                              : "text-lupetti-tealDark"
                        }
                      >
                        {esaurito
                          ? "Posti esauriti"
                          : `${rimasti} ${rimasti === 1 ? "posto libero" : "posti liberi"} su ${capienza}`}
                      </span>
                    </div>
                    <div
                      className="w-full h-2 rounded-full bg-slate-100 overflow-hidden"
                      aria-hidden
                    >
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          esaurito
                            ? "bg-rose-400"
                            : rimasti <= 3
                              ? "bg-amber-400"
                              : "bg-gradient-to-r from-lupetti-teal to-lupetti-sky"
                        }`}
                        style={{ width: `${percentuale}%` }}
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={esaurito || chiuso}
                    onClick={() => {
                      setEsito(null);
                      setScelto(evento);
                    }}
                    className="btn-pieno w-full"
                  >
                    <CalendarCheck className="w-4 h-4" aria-hidden />
                    <span>
                      {chiuso
                        ? "Prenotazioni chiuse"
                        : esaurito
                          ? "Al completo"
                          : "Prenota un posto"}
                    </span>
                  </button>
                </div>
              ) : (
                <p className="px-6 pb-6 pt-3 border-t border-slate-100 text-xs font-bold text-slate-600">
                  Ingresso libero, senza prenotazione.
                </p>
              )}
            </article>
          );
        })}
      </div>

      {scelto && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={chiudi}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`Prenotazione: ${scelto.title ?? "evento"}`}
            className="bg-white rounded-md max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-lupetti-teal/20 max-h-[92vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 pb-4 mb-5 border-b border-slate-100">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-lupetti-tealDark">
                  Prenotazione a numero chiuso
                </span>
                <h3 className="font-display text-xl sm:text-2xl font-bold text-slate-800 mt-0.5">
                  {scelto.title}
                </h3>
                <p className="text-xs font-bold text-lupetti-skyDark mt-1">
                  {formattaEvento(scelto.inizio, scelto.fine)}
                </p>
              </div>
              <button
                type="button"
                onClick={chiudi}
                aria-label="Chiudi"
                className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700"
              >
                <X className="w-4 h-4" aria-hidden />
              </button>
            </div>

            {esito ? (
              <PrenotazioneRiuscita esito={esito} onChiudi={chiudi} />
            ) : (
              <ModuloFamiglia
                destinazione={{ tipo: "evento", eventoId: scelto._id }}
                maxBambini={Math.min(
                  maxBambini,
                  postiScelto?.rimasti ?? maxBambini
                )}
                privacyHref={privacyHref}
                onRiuscita={(nuovo) => {
                  setEsito(nuovo);
                  caricaPosti();
                }}
                onErrore={caricaPosti}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
