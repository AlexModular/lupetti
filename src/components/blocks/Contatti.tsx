import {
  Accessibility,
  Baby,
  Car,
  Clock,
  CreditCard,
  Heart,
  Info,
  Mail,
  MapPin,
  Phone,
  type LucideIcon,
} from "lucide-react";

import ApertoOra from "@/components/ApertoOra";
import SectionHeader from "@/components/SectionHeader";
import { riepilogoOrari } from "@/lib/orari";
import { indirizzoCompleto, telefonoHref } from "@/lib/sito";
import type { Impostazioni, MapBlock } from "@/types";

import ContactForm from "./ContactForm";

const ICONE: Record<string, LucideIcon> = {
  Baby,
  Car,
  CreditCard,
  Accessibility,
  Heart,
  Info,
};

/** Mappa, orari, recapiti e modulo "scrivici". I dati vengono dalle Impostazioni generali. */
export default function Contatti({
  item,
  impostazioni,
}: {
  item: MapBlock;
  impostazioni: Impostazioni | null;
}) {
  const indirizzo = indirizzoCompleto(impostazioni);
  const orari = riepilogoOrari(impostazioni?.orari);
  const haOrari = orari.some((r) => r.orari.length > 0);
  const info = impostazioni?.infoUtili ?? [];
  const conModulo = item.showForm !== false;

  return (
    <section
      id="contatti"
      className="py-14 sm:py-20 bg-gradient-to-b from-lupetti-tealLight/35 to-white scroll-mt-24"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          tagline={item.tagline}
          heading={item.heading}
          description={item.subtitle}
        />

        <div className="space-y-8">
          {info.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {info.map((voce, i) => {
                const Icona = ICONE[voce.icona || ""] ?? Info;
                return (
                  <div
                    key={voce._key}
                    className="bg-white rounded p-5 border border-lupetti-teal/20 shadow-sm flex items-start gap-3.5"
                  >
                    <div
                      className={`w-10 h-10 rounded flex items-center justify-center shrink-0 ${
                        i % 2
                          ? "bg-lupetti-skyLight text-lupetti-skyDark"
                          : "bg-lupetti-tealLight text-lupetti-tealDark"
                      }`}
                    >
                      <Icona className="w-5 h-5" aria-hidden />
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-sm text-slate-800">
                        {voce.titolo}
                      </h3>
                      {voce.testo && (
                        <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                          {voce.testo}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div
              className={`space-y-6 ${
                conModulo ? "lg:col-span-5" : "lg:col-span-12 lg:grid lg:grid-cols-2 lg:gap-8 lg:space-y-0"
              }`}
            >
              {haOrari && (
                <div className="bg-white rounded-md p-6 sm:p-7 border border-lupetti-teal/20 shadow-card">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-11 h-11 rounded bg-lupetti-tealLight text-lupetti-tealDark flex items-center justify-center">
                      <Clock className="w-5 h-5" aria-hidden />
                    </div>
                    <div>
                      <h3 className="font-display text-xl font-bold text-slate-800">
                        Orari di apertura
                      </h3>
                      <ApertoOra orari={impostazioni?.orari} className="mt-1" />
                    </div>
                  </div>

                  <dl className="space-y-2 text-sm">
                    {orari.map((riga, i) => (
                      <div
                        key={riga.giorni}
                        className={`p-3.5 rounded flex items-center justify-between gap-4 ${
                          riga.orari.length === 0
                            ? "bg-slate-50"
                            : i % 2
                              ? "bg-lupetti-skyLight/60"
                              : "bg-lupetti-tealLight/50"
                        }`}
                      >
                        <dt className="font-bold text-slate-700">{riga.giorni}</dt>
                        <dd
                          className={`font-extrabold text-right ${
                            riga.orari.length === 0
                              ? "text-slate-500"
                              : "text-lupetti-tealDark"
                          }`}
                        >
                          {riga.orari.length
                            ? riga.orari.map((o) => <div key={o}>{o}</div>)
                            : "Chiuso"}
                        </dd>
                      </div>
                    ))}
                  </dl>
                  {impostazioni?.notaOrari && (
                    <p className="text-xs text-slate-600 pt-3 text-center font-bold">
                      {impostazioni.notaOrari}
                    </p>
                  )}
                </div>
              )}

              <div className="bg-white rounded-md p-6 sm:p-7 border border-lupetti-sky/20 shadow-card space-y-4">
                {indirizzo && (
                  <div className="flex items-start gap-3">
                    <MapPin
                      className="w-5 h-5 text-lupetti-skyDark mt-1 shrink-0"
                      aria-hidden
                    />
                    <div>
                      <h3 className="font-display font-bold text-lg text-slate-800">
                        {indirizzo}
                      </h3>
                      {impostazioni?.indicazioni && (
                        <p className="text-xs text-slate-600 mt-1">
                          {impostazioni.indicazioni}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {impostazioni?.telefono && (
                    <a
                      href={telefonoHref(impostazioni.telefono)}
                      className="p-3 rounded border border-slate-200 hover:border-lupetti-tealDark flex items-center gap-2.5 text-xs font-bold text-slate-700"
                    >
                      <Phone
                        className="w-4 h-4 text-lupetti-tealDark shrink-0"
                        aria-hidden
                      />
                      <span className="truncate">{impostazioni.telefono}</span>
                    </a>
                  )}
                  {impostazioni?.email && (
                    <a
                      href={`mailto:${impostazioni.email}`}
                      className="p-3 rounded border border-slate-200 hover:border-lupetti-skyDark flex items-center gap-2.5 text-xs font-bold text-slate-700"
                    >
                      <Mail
                        className="w-4 h-4 text-lupetti-skyDark shrink-0"
                        aria-hidden
                      />
                      <span className="truncate">{impostazioni.email}</span>
                    </a>
                  )}
                </div>

                {indirizzo && (
                  <div className="rounded overflow-hidden border border-slate-200">
                    <iframe
                      title={`Mappa: ${indirizzo}`}
                      src={`https://maps.google.com/maps?q=${encodeURIComponent(
                        indirizzo
                      )}&z=16&output=embed`}
                      className="w-full h-56 border-0"
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  </div>
                )}
              </div>
            </div>

            {conModulo && (
              <div className="lg:col-span-7">
                <ContactForm
                  whatsapp={impostazioni?.whatsapp}
                  email={impostazioni?.email}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
