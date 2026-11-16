"use client";

import { ChevronLeft, ChevronRight, Clock, Loader2, Users } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import {
  aggiungiGiorni,
  daMinuti,
  fascePerData,
  formattaData,
  GIORNI,
  giornoSettimana,
  inMinuti,
  oraRoma,
  slotDaFasce,
  SLOT_MINUTI,
  type OrariSettimanali,
} from "@/lib/orari";
import type {
  DisponibilitaLudoteca,
  EsitoPrenotazione,
  RegolePrenotazioni,
  SlotDisponibilita,
} from "@/types";

import ModuloFamiglia, { PrenotazioneRiuscita } from "./ModuloFamiglia";

interface LudotecaPrenotazioneProps {
  regole: RegolePrenotazioni | null;
  orari: OrariSettimanali | null;
  privacyHref?: string | null;
}

const INIZIALI = ["L", "M", "M", "G", "V", "S", "D"];

const maiuscola = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const nomeMese = (mese: string) => {
  const [y, m] = mese.split("-").map(Number);
  return maiuscola(
    new Intl.DateTimeFormat("it-IT", {
      timeZone: "UTC",
      month: "long",
      year: "numeric",
    }).format(new Date(Date.UTC(y, m - 1, 1)))
  );
};

const spostaMese = (mese: string, delta: number) => {
  const [y, m] = mese.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1 + delta, 1)).toISOString().slice(0, 7);
};

/**
 * Prenotazione oraria della ludoteca:
 * 1. si sceglie il giorno dal calendario (i giorni di chiusura sono spenti)
 * 2. si scelgono una o più ore di fila, vedendo i posti rimasti
 * 3. si compilano i dati e si conferma
 */
export default function LudotecaPrenotazione({
  regole,
  orari,
  privacyHref,
}: LudotecaPrenotazioneProps) {
  const anticipo = regole?.anticipoMassimoGiorni ?? 30;
  const maxOre = regole?.maxOrePerPrenotazione ?? 3;
  const maxBambini = regole?.maxBambiniPerPrenotazione ?? 4;

  const [oggi, setOggi] = useState<string | null>(null);
  const [mese, setMese] = useState<string | null>(null);
  const [giorno, setGiorno] = useState<string | null>(null);
  const [disponibilita, setDisponibilita] =
    useState<DisponibilitaLudoteca | null>(null);
  const [caricamento, setCaricamento] = useState(false);
  const [erroreRete, setErroreRete] = useState(false);
  const [selezione, setSelezione] = useState<string[]>([]);
  const [esito, setEsito] = useState<EsitoPrenotazione | null>(null);

  /** true se quel giorno ha almeno una fascia e non è una chiusura. */
  const isPrenotabile = useCallback(
    (data: string, da: string) =>
      data >= da &&
      data <= aggiungiGiorni(da, anticipo) &&
      !regole?.eccezioni?.some((e) => e.data === data && e.chiuso) &&
      slotDaFasce(fascePerData(orari, data)).length > 0,
    [anticipo, orari, regole?.eccezioni]
  );

  // "Oggi" dipende da quando si guarda la pagina: si calcola nel browser.
  // Si parte già sul primo giorno prenotabile.
  useEffect(() => {
    const data = oraRoma().data;
    setOggi(data);
    let primo: string | null = null;
    for (let i = 0; i <= anticipo && !primo; i++) {
      const candidato = aggiungiGiorni(data, i);
      if (isPrenotabile(candidato, data)) primo = candidato;
    }
    setGiorno(primo);
    setMese((primo ?? data).slice(0, 7));
  }, [anticipo, isPrenotabile]);

  const carica = useCallback(async (data: string, segnale?: AbortSignal) => {
    setCaricamento(true);
    setErroreRete(false);
    try {
      const res = await fetch(`/api/prenotazioni/ludoteca?data=${data}`, {
        cache: "no-store",
        signal: segnale,
      });
      if (!res.ok) throw new Error(String(res.status));
      setDisponibilita((await res.json()) as DisponibilitaLudoteca);
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      setDisponibilita(null);
      setErroreRete(true);
    } finally {
      if (!segnale?.aborted) setCaricamento(false);
    }
  }, []);

  useEffect(() => {
    if (!giorno) return;
    const controller = new AbortController();
    setSelezione([]);
    setEsito(null);
    setDisponibilita(null);
    carica(giorno, controller.signal);
    return () => controller.abort();
  }, [giorno, carica]);

  const celle = useMemo(() => {
    if (!mese) return [];
    const [y, m] = mese.split("-").map(Number);
    const giorniNelMese = new Date(Date.UTC(y, m, 0)).getUTCDate();
    // Settimana che parte da lunedì: quante caselle vuote prima dell'1.
    const vuote = (GIORNI.indexOf(giornoSettimana(`${mese}-01`)) + 6) % 7;
    return [
      ...Array.from({ length: vuote }, () => null),
      ...Array.from(
        { length: giorniNelMese },
        (_, i) => `${mese}-${String(i + 1).padStart(2, "0")}`
      ),
    ];
  }, [mese]);

  if (regole?.ludotecaAttiva === false) {
    return (
      <p className="rounded-md border border-dashed border-lupetti-teal/30 bg-white p-8 text-center text-slate-600">
        Le prenotazioni online della ludoteca sono momentaneamente sospese.
        Contattaci per sapere quando c&apos;è posto.
      </p>
    );
  }

  if (!oggi || !mese) {
    return (
      <div
        className="rounded-md border border-lupetti-teal/20 bg-white min-h-[26rem] flex items-center justify-center text-slate-500"
        role="status"
      >
        <Loader2 className="w-6 h-6 animate-spin" aria-hidden />
        <span className="sr-only">Caricamento del calendario…</span>
      </div>
    );
  }

  const ultimo = aggiungiGiorni(oggi, anticipo);
  const slots = disponibilita?.slots ?? [];
  const scelti = selezione
    .map((ora) => slots.find((s) => s.ora === ora))
    .filter((s): s is SlotDisponibilita => Boolean(s));
  const postiMinimi = scelti.length
    ? Math.min(...scelti.map((s) => s.rimasti))
    : 0;

  function scegli(slot: SlotDisponibilita) {
    setEsito(null);
    setSelezione((scelte) => {
      const indice = slots.findIndex((s) => s.ora === slot.ora);
      // Se nel frattempo un'ora scelta si è riempita, si riparte da capo.
      const ancoraLibere = scelte.every((ora) =>
        slots.some((s) => s.ora === ora && s.stato === "disponibile")
      );
      const attuale = ancoraLibere ? scelte : [];
      if (attuale.includes(slot.ora)) {
        // Si può togliere solo la prima o l'ultima ora, per restare di fila.
        if (slot.ora === attuale[0]) return attuale.slice(1);
        if (slot.ora === attuale[attuale.length - 1]) return attuale.slice(0, -1);
        return [slot.ora];
      }
      if (attuale.length > 0 && attuale.length < maxOre) {
        const primo = slots.findIndex((s) => s.ora === attuale[0]);
        const ultimoIndice = slots.findIndex(
          (s) => s.ora === attuale[attuale.length - 1]
        );
        if (indice === ultimoIndice + 1 && slots[ultimoIndice].fine === slot.ora) {
          return [...attuale, slot.ora];
        }
        if (indice === primo - 1 && slot.fine === slots[primo].ora) {
          return [slot.ora, ...attuale];
        }
      }
      return [slot.ora];
    });
  }

  const riepilogo = scelti.length
    ? `${maiuscola(formattaData(giorno as string))} · ${scelti[0].ora} – ${daMinuti(
        inMinuti(scelti[scelti.length - 1].ora) + SLOT_MINUTI
      )}`
    : null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* 1. Calendario */}
      <div className="lg:col-span-5 bg-white rounded-md border border-lupetti-teal/20 shadow-card p-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <button
            type="button"
            onClick={() => setMese(spostaMese(mese, -1))}
            disabled={mese <= oggi.slice(0, 7)}
            aria-label="Mese precedente"
            className="p-2 rounded-full bg-lupetti-tealLight text-lupetti-tealDark disabled:opacity-30"
          >
            <ChevronLeft className="w-4 h-4" aria-hidden />
          </button>
          <h3 className="font-display font-bold text-lg text-slate-800">
            {nomeMese(mese)}
          </h3>
          <button
            type="button"
            onClick={() => setMese(spostaMese(mese, 1))}
            disabled={mese >= ultimo.slice(0, 7)}
            aria-label="Mese successivo"
            className="p-2 rounded-full bg-lupetti-tealLight text-lupetti-tealDark disabled:opacity-30"
          >
            <ChevronRight className="w-4 h-4" aria-hidden />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center">
          {INIZIALI.map((iniziale, i) => (
            <span
              key={i}
              aria-hidden
              className="text-xs font-extrabold text-slate-500 py-1"
            >
              {iniziale}
            </span>
          ))}
          {celle.map((data, i) => {
            if (!data) return <span key={`vuota-${i}`} />;
            const prenotabile = isPrenotabile(data, oggi);
            const attivo = data === giorno;
            return (
              <button
                key={data}
                type="button"
                disabled={!prenotabile}
                onClick={() => setGiorno(data)}
                aria-label={formattaData(data, { anno: true })}
                aria-pressed={attivo}
                className={`aspect-square rounded text-sm font-bold transition-colors ${
                  attivo
                    ? "bg-lupetti-tealDark text-white shadow-sm"
                    : prenotabile
                      ? "bg-lupetti-tealLight/60 text-slate-800 hover:bg-lupetti-teal/30"
                      : "text-slate-300 cursor-not-allowed"
                } ${data === oggi && !attivo ? "ring-2 ring-lupetti-sky/60" : ""}`}
              >
                {Number(data.slice(8))}
              </button>
            );
          })}
        </div>

        <p className="mt-4 text-xs text-slate-600 flex items-start gap-2">
          <Users className="w-4 h-4 text-lupetti-tealDark shrink-0" aria-hidden />
          <span>
            Fino a {regole?.capienzaOraria ?? 12} bambini per ora
            {regole?.prezzoInfo ? ` · ${regole.prezzoInfo}` : ""}. Si prenota
            con al massimo {anticipo} giorni di anticipo.
          </span>
        </p>
      </div>

      {/* 2. Fasce orarie e 3. dati */}
      <div className="lg:col-span-7 bg-white rounded-md border border-lupetti-teal/20 shadow-card p-5 sm:p-7">
        {!giorno ? (
          <p className="text-slate-600 text-center py-10">
            Nei prossimi {anticipo} giorni non ci sono fasce prenotabili.
            Contattaci per maggiori informazioni.
          </p>
        ) : esito ? (
          <PrenotazioneRiuscita
            esito={esito}
            testoChiudi="Fai un'altra prenotazione"
            onChiudi={() => {
              setEsito(null);
              setSelezione([]);
            }}
          />
        ) : (
          <>
            <h3 className="font-display font-bold text-lg text-slate-800 flex items-center gap-2">
              <Clock className="w-5 h-5 text-lupetti-tealDark" aria-hidden />
              {maiuscola(formattaData(giorno))}
            </h3>
            <p className="text-xs text-slate-600 mt-1 mb-4">
              {maxOre > 1
                ? `Tocca un'ora per sceglierla. Puoi prenotare fino a ${maxOre} ore di fila.`
                : "Tocca l'ora che vuoi prenotare."}
            </p>

            {caricamento && (
              <p className="py-8 text-center text-slate-500" role="status">
                <Loader2 className="w-5 h-5 animate-spin inline" aria-hidden />{" "}
                Controllo i posti liberi…
              </p>
            )}

            {erroreRete && (
              <p className="py-6 text-center text-sm text-rose-700 font-bold">
                Non riusciamo a caricare i posti disponibili.{" "}
                <button
                  type="button"
                  className="underline"
                  onClick={() => carica(giorno)}
                >
                  Riprova
                </button>
              </p>
            )}

            {disponibilita && !disponibilita.aperta && (
              <p className="py-6 text-center text-slate-600">
                {disponibilita.motivo}
              </p>
            )}

            {disponibilita?.aperta && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {slots.map((slot) => {
                  const libero = slot.stato === "disponibile";
                  const attivo = selezione.includes(slot.ora);
                  return (
                    <button
                      key={slot.ora}
                      type="button"
                      disabled={!libero}
                      onClick={() => scegli(slot)}
                      aria-pressed={attivo}
                      className={`rounded border px-3 py-2.5 text-left transition-colors ${
                        attivo
                          ? "bg-lupetti-tealDark border-lupetti-tealDark text-white shadow-sm"
                          : libero
                            ? "bg-white border-lupetti-teal/30 hover:border-lupetti-tealDark text-slate-800"
                            : "bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed"
                      }`}
                    >
                      <span className="block font-display font-bold text-base">
                        {slot.ora} – {slot.fine}
                      </span>
                      <span
                        className={`block text-xs font-bold ${
                          attivo
                            ? "text-white/90"
                            : libero
                              ? slot.rimasti <= 3
                                ? "text-amber-700"
                                : "text-lupetti-tealDark"
                              : ""
                        }`}
                      >
                        {libero
                          ? `${slot.rimasti} ${
                              slot.rimasti === 1 ? "posto libero" : "posti liberi"
                            }`
                          : slot.nota || "Non disponibile"}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {riepilogo && (
              <div className="mt-6 pt-6 border-t border-slate-100 space-y-4">
                <p className="p-3.5 rounded bg-lupetti-tealLight/60 border border-lupetti-teal/25 text-sm font-bold text-slate-800">
                  Stai prenotando: {riepilogo}
                </p>
                <ModuloFamiglia
                  destinazione={{
                    tipo: "ludoteca",
                    data: giorno,
                    slots: selezione,
                  }}
                  maxBambini={Math.min(maxBambini, postiMinimi)}
                  privacyHref={privacyHref}
                  onRiuscita={(nuovo) => {
                    setEsito(nuovo);
                    carica(giorno);
                  }}
                  onErrore={() => carica(giorno)}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
