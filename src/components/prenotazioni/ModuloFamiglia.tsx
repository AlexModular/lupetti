"use client";

import { AlertCircle, CalendarCheck, CheckCircle2, Loader2 } from "lucide-react";
import Link from "next/link";
import { useId, useState, type FormEvent } from "react";

import type { EsitoPrenotazione } from "@/types";

const CAMPO =
  "w-full px-3.5 py-2.5 rounded border border-slate-300 focus:border-lupetti-tealDark focus:ring-2 focus:ring-lupetti-teal/25 outline-none text-sm bg-white";
const ETICHETTA = "block text-xs font-bold text-slate-700 mb-1";

interface ModuloFamigliaProps {
  /** Cosa si sta prenotando: viene inviato insieme ai dati della famiglia. */
  destinazione:
    | { tipo: "evento"; eventoId: string }
    | { tipo: "ludoteca"; data: string; slots: string[] };
  /** Quanti bambini si possono prenotare al massimo (posti rimasti inclusi). */
  maxBambini: number;
  privacyHref?: string | null;
  onRiuscita: (esito: EsitoPrenotazione) => void;
  /** Chiamata quando il server rifiuta: di solito i posti sono cambiati. */
  onErrore?: () => void;
}

/**
 * Modulo con i dati del genitore e del bambino, comune a laboratori e
 * ludoteca. Invia la prenotazione e comunica l'esito al componente che lo usa.
 */
export default function ModuloFamiglia({
  destinazione,
  maxBambini,
  privacyHref,
  onRiuscita,
  onErrore,
}: ModuloFamigliaProps) {
  const id = useId();
  const [invio, setInvio] = useState(false);
  const [errore, setErrore] = useState<string | null>(null);
  const [bambini, setBambini] = useState(1);

  const max = Math.max(1, maxBambini);
  const quanti = Math.min(bambini, max);

  async function invia(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (invio) return;
    const campi = new FormData(e.currentTarget);

    setInvio(true);
    setErrore(null);
    try {
      const res = await fetch("/api/prenotazioni", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...destinazione,
          genitoreNome: campi.get("genitoreNome"),
          telefono: campi.get("telefono"),
          email: campi.get("email"),
          bambinoNome: campi.get("bambinoNome"),
          bambinoEta: campi.get("bambinoEta"),
          note: campi.get("note"),
          bambini: quanti,
          consensoPrivacy: campi.get("consensoPrivacy") === "on",
          sito: campi.get("sito"),
        }),
      });
      const risposta = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErrore(
          risposta.error || "Non è stato possibile completare la prenotazione."
        );
        onErrore?.();
        return;
      }
      onRiuscita(risposta.prenotazione as EsitoPrenotazione);
    } catch {
      setErrore("Errore di connessione. Riprova tra qualche istante.");
    } finally {
      setInvio(false);
    }
  }

  return (
    <form onSubmit={invia} className="space-y-4">
      {errore && (
        <div
          role="alert"
          className="p-3.5 rounded bg-rose-50 border border-rose-200 text-rose-800 text-sm font-bold flex items-start gap-2"
        >
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden />
          <span>{errore}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div>
          <label htmlFor={`${id}-genitore`} className={ETICHETTA}>
            Nome e cognome del genitore *
          </label>
          <input
            id={`${id}-genitore`}
            name="genitoreNome"
            type="text"
            required
            minLength={2}
            maxLength={80}
            autoComplete="name"
            className={CAMPO}
          />
        </div>
        <div>
          <label htmlFor={`${id}-telefono`} className={ETICHETTA}>
            Telefono *
          </label>
          <input
            id={`${id}-telefono`}
            name="telefono"
            type="tel"
            required
            maxLength={24}
            autoComplete="tel"
            className={CAMPO}
          />
        </div>
      </div>

      <div>
        <label htmlFor={`${id}-email`} className={ETICHETTA}>
          Email *
        </label>
        <input
          id={`${id}-email`}
          name="email"
          type="email"
          required
          maxLength={120}
          autoComplete="email"
          className={CAMPO}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div>
          <label htmlFor={`${id}-bambino`} className={ETICHETTA}>
            {quanti > 1 ? "Nomi dei bambini *" : "Nome del bimbo/a *"}
          </label>
          <input
            id={`${id}-bambino`}
            name="bambinoNome"
            type="text"
            required
            maxLength={120}
            className={CAMPO}
          />
        </div>
        <div>
          <label htmlFor={`${id}-eta`} className={ETICHETTA}>
            Età *
          </label>
          <input
            id={`${id}-eta`}
            name="bambinoEta"
            type="text"
            required
            maxLength={40}
            placeholder={quanti > 1 ? "Es. 4 e 6 anni" : "Es. 5 anni"}
            className={CAMPO}
          />
        </div>
        <div>
          <label htmlFor={`${id}-bambini`} className={ETICHETTA}>
            Quanti bambini *
          </label>
          <select
            id={`${id}-bambini`}
            value={quanti}
            onChange={(e) => setBambini(Number(e.target.value))}
            className={`${CAMPO} font-bold`}
          >
            {Array.from({ length: max }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                {n} {n === 1 ? "bambino" : "bambini"}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor={`${id}-note`} className={ETICHETTA}>
          Note (facoltative)
        </label>
        <input
          id={`${id}-note`}
          name="note"
          type="text"
          maxLength={500}
          placeholder="Allergie, esigenze particolari…"
          className={CAMPO}
        />
      </div>

      {/* Campo trappola per i bot: nascosto a chi usa il sito. */}
      <div className="hidden" aria-hidden>
        <label>
          Sito web
          <input name="sito" type="text" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <label className="flex items-start gap-2.5 text-xs text-slate-600 leading-relaxed">
        <input
          name="consensoPrivacy"
          type="checkbox"
          required
          className="mt-0.5 w-4 h-4 accent-lupetti-tealDark shrink-0"
        />
        <span>
          Acconsento al trattamento dei dati inseriti per gestire questa
          prenotazione
          {privacyHref ? (
            <>
              , come descritto nell&apos;
              <Link
                href={privacyHref}
                target="_blank"
                className="font-bold text-lupetti-tealDark underline"
              >
                informativa privacy
              </Link>
            </>
          ) : null}
          . *
        </span>
      </label>

      <button
        type="submit"
        disabled={invio}
        className="btn-pieno w-full"
      >
        {invio ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" aria-hidden />
            <span>Registrazione in corso…</span>
          </>
        ) : (
          <>
            <CalendarCheck className="w-4 h-4" aria-hidden />
            <span>Conferma la prenotazione</span>
          </>
        )}
      </button>
    </form>
  );
}

/** Messaggio finale con codice e riepilogo. */
export function PrenotazioneRiuscita({
  esito,
  onChiudi,
  testoChiudi = "Chiudi",
}: {
  esito: EsitoPrenotazione;
  onChiudi: () => void;
  testoChiudi?: string;
}) {
  const confermata = esito.stato === "confermata";
  return (
    <div className="py-4 text-center space-y-4" role="status">
      <div className="w-14 h-14 rounded-full bg-lupetti-tealLight text-lupetti-tealDark flex items-center justify-center mx-auto">
        <CheckCircle2 className="w-8 h-8" aria-hidden />
      </div>
      <h4 className="font-display text-2xl font-bold text-slate-800">
        {confermata ? "Prenotazione confermata!" : "Richiesta ricevuta!"}
      </h4>
      <p className="text-sm text-slate-600">
        <strong>{esito.cosa}</strong>
        <br />
        {esito.quando} · {esito.bambini}{" "}
        {esito.bambini === 1 ? "bambino" : "bambini"}
      </p>
      {!confermata && (
        <p className="text-sm text-slate-600">
          I posti sono riservati: ti ricontattiamo per la conferma.
        </p>
      )}
      <div className="p-4 rounded bg-lupetti-tealLight/60 border border-lupetti-teal/25 inline-block">
        <span className="text-xs font-bold uppercase text-slate-600 block">
          Codice prenotazione
        </span>
        <span className="font-display text-2xl font-bold text-lupetti-tealDark tracking-wider">
          {esito.codice}
        </span>
      </div>
      <p className="text-xs text-slate-500">
        Conserva il codice: ti servirà per modificare o annullare.
      </p>
      <button
        type="button"
        onClick={onChiudi}
        className="btn-pieno w-full"
      >
        {testoChiudi}
      </button>
    </div>
  );
}
