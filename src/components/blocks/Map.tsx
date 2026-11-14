import React from "react";
import ContactSection from "@/components/ContactSection";

export interface MapBlockProps {
  tagline?: string;
  heading?: string;
  subtitle?: string;
}

export interface SiteSettingsForMap {
  telefono: string;
  whatsapp: string;
  email: string;
  indirizzo: string;
  indicazioniParcheggio: string;
  orariMattina: string;
  orariPomeriggio: string;
  orariDomenica: string;
}

export default function MapBlock({
  item,
  impostazioni,
}: {
  item: MapBlockProps;
  impostazioni: SiteSettingsForMap;
}) {
  return (
    <section className="py-14 sm:py-20 bg-gradient-to-b from-lupetti-tealLight/35 to-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {(item.tagline || item.heading || item.subtitle) && (
          <div className="max-w-2xl mb-10">
            {item.tagline && (
              <span className="text-xs font-extrabold uppercase tracking-wider text-lupetti-teal">
                {item.tagline}
              </span>
            )}
            {item.heading && (
              <h1 className="font-display text-3xl sm:text-4xl font-bold text-slate-800 mt-1">
                {item.heading}
              </h1>
            )}
            {item.subtitle && (
              <p className="mt-2 text-base text-slate-600">{item.subtitle}</p>
            )}
          </div>
        )}

        <ContactSection
          telefono={impostazioni.telefono}
          whatsapp={impostazioni.whatsapp}
          email={impostazioni.email}
          indirizzo={impostazioni.indirizzo}
          indicazioniParcheggio={impostazioni.indicazioniParcheggio}
          orariMattina={impostazioni.orariMattina}
          orariPomeriggio={impostazioni.orariPomeriggio}
          orariDomenica={impostazioni.orariDomenica}
        />
      </div>
    </section>
  );
}

