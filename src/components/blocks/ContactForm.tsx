"use client";

import { MessageCircle, Send } from "lucide-react";
import { useState, type FormEvent } from "react";

import { whatsappUrl } from "@/lib/sito";

const ARGOMENTI = [
  "Ludoteca e baby parking",
  "Laboratori per bambini",
  "Feste di compleanno",
  "Giocattoli disponibili in negozio",
  "Altro",
];

const CAMPO =
  "w-full px-4 py-3 rounded border border-slate-300 focus:border-lupetti-tealDark focus:ring-2 focus:ring-lupetti-teal/25 outline-none text-sm bg-white";

/**
 * Modulo "scrivici": non salva nulla sul sito. Prepara il messaggio e apre
 * WhatsApp oppure il programma di posta del genitore.
 */
export default function ContactForm({
  whatsapp,
  email,
}: {
  whatsapp?: string | null;
  email?: string | null;
}) {
  const [nome, setNome] = useState("");
  const [argomento, setArgomento] = useState(ARGOMENTI[0]);
  const [messaggio, setMessaggio] = useState("");

  const testo = () =>
    [
      "Ciao I Lupetti!",
      `Sono ${nome || "un genitore"} e vi scrivo dal sito (${argomento}).`,
      messaggio,
    ]
      .filter(Boolean)
      .join("\n");

  const haWhatsapp = Boolean(whatsappUrl(whatsapp));
  if (!haWhatsapp && !email) return null;

  const apriEmail = () => {
    window.location.href = `mailto:${email}?subject=${encodeURIComponent(
      `Richiesta informazioni: ${argomento}`
    )}&body=${encodeURIComponent(testo())}`;
  };

  function invia(e: FormEvent) {
    e.preventDefault();
    const url = whatsappUrl(whatsapp, testo());
    if (url) window.open(url, "_blank", "noopener,noreferrer");
    else apriEmail();
  }

  return (
    <div className="bg-white rounded-md p-6 sm:p-9 border border-lupetti-teal/20 shadow-soft">
      <h3 className="font-display text-2xl font-bold text-slate-800 mb-1">
        Scrivici un messaggio
      </h3>
      <p className="text-sm text-slate-600 mb-6">
        Per informazioni sui giochi in negozio, sulla ludoteca, sui laboratori o
        sulle feste.
      </p>

      <form onSubmit={invia} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="contatto-nome"
              className="block text-xs font-bold text-slate-700 mb-1.5"
            >
              Il tuo nome *
            </label>
            <input
              id="contatto-nome"
              type="text"
              required
              autoComplete="given-name"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className={CAMPO}
            />
          </div>
          <div>
            <label
              htmlFor="contatto-argomento"
              className="block text-xs font-bold text-slate-700 mb-1.5"
            >
              Argomento
            </label>
            <select
              id="contatto-argomento"
              value={argomento}
              onChange={(e) => setArgomento(e.target.value)}
              className={`${CAMPO} font-semibold`}
            >
              {ARGOMENTI.map((a) => (
                <option key={a}>{a}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label
            htmlFor="contatto-messaggio"
            className="block text-xs font-bold text-slate-700 mb-1.5"
          >
            Messaggio *
          </label>
          <textarea
            id="contatto-messaggio"
            rows={4}
            required
            value={messaggio}
            onChange={(e) => setMessaggio(e.target.value)}
            className={`${CAMPO} resize-none`}
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            type="submit"
            className="btn-pieno flex-1"
          >
            {haWhatsapp ? (
              <>
                <MessageCircle className="w-4 h-4" aria-hidden />
                <span>Invia su WhatsApp</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" aria-hidden />
                <span>Invia via email</span>
              </>
            )}
          </button>
          {haWhatsapp && email && (
            <button
              type="button"
              onClick={apriEmail}
              className="btn-bordo"
            >
              <Send className="w-4 h-4 text-lupetti-skyDark" aria-hidden />
              <span>Invia via email</span>
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
