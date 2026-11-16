"use client";

import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { useId, useState, type FormEvent } from "react";

const CAMPO =
  "w-full px-3.5 py-2.5 rounded border border-slate-300 focus:border-lupetti-tealDark focus:ring-2 focus:ring-lupetti-teal/25 outline-none text-sm bg-white";

interface Annullata {
  codice: string;
  cosa: string;
  quando: string;
  giaAnnullata: boolean;
}

/**
 * Riquadro richiudibile con cui il genitore annulla da solo una prenotazione,
 * inserendo il codice ricevuto e l'email usata per prenotare.
 */
export default function AnnullaPrenotazione() {
  const id = useId();
  const [invio, setInvio] = useState(false);
  const [errore, setErrore] = useState<string | null>(null);
  const [annullata, setAnnullata] = useState<Annullata | null>(null);

  async function invia(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (invio) return;
    const campi = new FormData(e.currentTarget);
    setInvio(true);
    setErrore(null);
    try {
      const res = await fetch("/api/prenotazioni/annulla", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          codice: campi.get("codice"),
          email: campi.get("email"),
        }),
      });
      const risposta = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErrore(risposta.error || "Non è stato possibile annullare.");
        return;
      }
      setAnnullata(risposta.annullata as Annullata);
    } catch {
      setErrore("Errore di connessione. Riprova tra qualche istante.");
    } finally {
      setInvio(false);
    }
  }

  return (
    <details className="mt-8 max-w-xl mx-auto rounded border border-slate-200 bg-white">
      <summary className="cursor-pointer px-5 py-3.5 text-sm font-bold text-slate-700 hover:text-lupetti-tealDark">
        Devi annullare una prenotazione?
      </summary>
      <div className="px-5 pb-5">
        {annullata ? (
          <p
            role="status"
            className="p-3.5 rounded bg-lupetti-tealLight/60 border border-lupetti-teal/25 text-sm text-slate-800 flex items-start gap-2"
          >
            <CheckCircle2
              className="w-4 h-4 shrink-0 mt-0.5 text-lupetti-tealDark"
              aria-hidden
            />
            <span>
              {annullata.giaAnnullata
                ? "Questa prenotazione era già stata annullata"
                : "Prenotazione annullata"}
              : <strong>{annullata.cosa}</strong>, {annullata.quando}. I posti
              sono tornati disponibili.
            </span>
          </p>
        ) : (
          <form onSubmit={invia} className="space-y-3">
            <p className="text-xs text-slate-600">
              Inserisci il codice che hai ricevuto e l&apos;email usata per
              prenotare. Si può annullare fino all&apos;orario di inizio.
            </p>
            {errore && (
              <p
                role="alert"
                className="p-3 rounded bg-rose-50 border border-rose-200 text-rose-800 text-sm font-bold flex items-start gap-2"
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden />
                <span>{errore}</span>
              </p>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor={`${id}-codice`}
                  className="block text-xs font-bold text-slate-700 mb-1"
                >
                  Codice prenotazione
                </label>
                <input
                  id={`${id}-codice`}
                  name="codice"
                  type="text"
                  required
                  maxLength={12}
                  placeholder="LUP-ABC123"
                  autoCapitalize="characters"
                  className={`${CAMPO} uppercase`}
                />
              </div>
              <div>
                <label
                  htmlFor={`${id}-email`}
                  className="block text-xs font-bold text-slate-700 mb-1"
                >
                  Email
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
            </div>
            <button
              type="submit"
              disabled={invio}
              className="px-5 py-2.5 rounded text-sm font-bold text-white bg-slate-700 hover:bg-slate-800 disabled:opacity-70 inline-flex items-center gap-2"
            >
              {invio && <Loader2 className="w-4 h-4 animate-spin" aria-hidden />}
              Annulla la prenotazione
            </button>
          </form>
        )}
      </div>
    </details>
  );
}
