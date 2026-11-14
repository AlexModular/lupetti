"use client";

import React, { useState } from "react";
import {
  MapPin,
  Clock,
  Phone,
  Mail,
  MessageCircle,
  Send,
  Car,
  CreditCard,
  Baby,
} from "lucide-react";

interface ContactSectionProps {
  telefono: string;
  whatsapp: string;
  email: string;
  indirizzo: string;
  indicazioniParcheggio: string;
  orariMattina: string;
  orariPomeriggio: string;
  orariDomenica: string;
}

export default function ContactSection({
  telefono,
  whatsapp,
  email,
  indirizzo,
  indicazioniParcheggio,
  orariMattina,
  orariPomeriggio,
  orariDomenica,
}: ContactSectionProps) {
  const [nome, setNome] = useState("");
  const [motivo, setMotivo] = useState("Informazioni Ludoteca / Baby Parking");
  const [messaggio, setMessaggio] = useState("");

  const buildMessageText = () => {
    const lines = [
      `Ciao I Lupetti!`,
      `Sono ${nome || "un genitore"} e vi scrivo dal sito (${motivo}).`,
      messaggio ? `${messaggio}` : null,
    ].filter(Boolean);
    return lines.join("\n");
  };

  const handleWhatsAppSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    window.open(
      `https://wa.me/${whatsapp}?text=${encodeURIComponent(buildMessageText())}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const handleEmailClick = () => {
    window.location.href = `mailto:${email}?subject=${encodeURIComponent(
      `Richiesta informazioni: ${motivo}`
    )}&body=${encodeURIComponent(buildMessageText())}`;
  };

  return (
    <div className="space-y-8">
      {/* Informazioni Utili Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-lupetti-teal/20 shadow-sm flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-lupetti-tealLight text-lupetti-tealDark flex items-center justify-center shrink-0">
            <Baby className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display font-bold text-sm text-slate-800">
              Servizi per i Più Piccoli
            </h3>
            <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
              Struttura attrezzata con <strong>fasciatoio</strong>, baby parking e attività per diverse fasce d&apos;età.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-lupetti-sky/20 shadow-sm flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-lupetti-skyLight text-lupetti-skyDark flex items-center justify-center shrink-0">
            <Car className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display font-bold text-sm text-slate-800">
              Parcheggio Gratuito
            </h3>
            <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
              Nei dintorni di Via Savigno 1/a è disponibile il <strong>parcheggio gratuito in strada</strong>.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-lupetti-teal/20 shadow-sm flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-lupetti-tealLight text-lupetti-tealDark flex items-center justify-center shrink-0">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display font-bold text-sm text-slate-800">
              Metodi di Pagamento
            </h3>
            <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
              Si accettano <strong>carte di credito, carte di debito</strong> e bancomat.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Orari & Mappa */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-lupetti-teal/20 shadow-card">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-11 h-11 rounded-2xl bg-lupetti-tealLight text-lupetti-tealDark flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-display text-xl font-bold text-slate-800">
                  Orari di Apertura
                </h2>
                <p className="text-xs font-bold text-lupetti-teal">
                  Dal Lunedì al Sabato
                </p>
              </div>
            </div>

            <div className="space-y-3 text-sm">
              <div className="p-3.5 rounded-2xl bg-lupetti-tealLight/50 flex items-center justify-between">
                <span className="font-bold text-slate-700">Mattina</span>
                <span className="font-extrabold text-lupetti-tealDark">
                  {orariMattina}
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-lupetti-skyLight/60 flex items-center justify-between">
                <span className="font-bold text-slate-700">Pomeriggio</span>
                <span className="font-extrabold text-lupetti-skyDark">
                  {orariPomeriggio}
                </span>
              </div>
              <p className="text-xs text-slate-500 pt-1 text-center font-bold">
                {orariDomenica}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-lupetti-sky/20 shadow-card space-y-4">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-lupetti-sky mt-1 shrink-0" />
              <div>
                <h3 className="font-display font-bold text-lg text-slate-800">
                  {indirizzo}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  {indicazioniParcheggio}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <a
                href={`tel:${telefono.replace(/\s+/g, "")}`}
                className="p-3 rounded-2xl border border-slate-200 hover:border-lupetti-teal flex items-center gap-2.5 text-xs font-bold text-slate-700"
              >
                <Phone className="w-4 h-4 text-lupetti-teal shrink-0" />
                <span className="truncate">{telefono}</span>
              </a>
              <a
                href={`mailto:${email}`}
                className="p-3 rounded-2xl border border-slate-200 hover:border-lupetti-sky flex items-center gap-2.5 text-xs font-bold text-slate-700"
              >
                <Mail className="w-4 h-4 text-lupetti-sky shrink-0" />
                <span className="truncate">{email}</span>
              </a>
            </div>

            <div className="rounded-2xl overflow-hidden border border-slate-200">
              <iframe
                title="Mappa I Lupetti Via Savigno 1/a Bologna"
                src={`https://maps.google.com/maps?q=${encodeURIComponent(
                  indirizzo
                )}&t=&z=16&ie=UTF8&iwloc=&output=embed`}
                className="w-full h-48 border-0"
                loading="lazy"
              />
            </div>
          </div>
        </div>

        {/* Form Contatto */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-9 border border-lupetti-teal/20 shadow-soft">
          <h2 className="font-display text-2xl font-bold text-slate-800 mb-1">
            Scrivici un Messaggio
          </h2>
          <p className="text-sm text-slate-500 mb-6">
            Per informazioni sui giochi disponibili in negozio, sul servizio di baby parking o sui laboratori per bambini.
          </p>

          <form onSubmit={handleWhatsAppSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">
                  Il tuo Nome *
                </label>
                <input
                  type="text"
                  required
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Es. Giulia"
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:border-lupetti-teal outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">
                  Argomento
                </label>
                <select
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:border-lupetti-teal outline-none text-sm bg-white font-semibold"
                >
                  <option value="Informazioni Ludoteca / Baby Parking">
                    Ludoteca &amp; Baby Parking
                  </option>
                  <option value="Informazioni Laboratori per Fasce d'Età">
                    Laboratori per bambini
                  </option>
                  <option value="Disponibilità Giocattoli in Negozio">
                    Negozio di Giocattoli
                  </option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">
                Messaggio *
              </label>
              <textarea
                rows={4}
                required
                value={messaggio}
                onChange={(e) => setMessaggio(e.target.value)}
                placeholder="Scrivi qui la tua richiesta..."
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:border-lupetti-teal outline-none text-sm resize-none"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="submit"
                className="flex-1 py-3.5 px-6 rounded-2xl font-display font-bold text-sm text-white bg-lupetti-teal hover:bg-lupetti-tealDark transition-colors flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Invia su WhatsApp</span>
              </button>

              <button
                type="button"
                onClick={handleEmailClick}
                className="py-3.5 px-6 rounded-2xl font-bold text-sm text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4 text-lupetti-skyDark" />
                <span>Invia via Email</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
