import { stegaClean } from "@sanity/client/stega";
import { ArrowRight, Check, MessageCircle, Star } from "lucide-react";

import AnnullaPrenotazione from "@/components/prenotazioni/AnnullaPrenotazione";
import EventsSection from "@/components/prenotazioni/EventsSection";
import LudotecaPrenotazione from "@/components/prenotazioni/LudotecaPrenotazione";
import SectionHeader from "@/components/SectionHeader";
import SmartLink from "@/components/SmartLink";
import { siteUrl, whatsappUrl } from "@/lib/sito";
import { getRegolePrenotazioni } from "@/sanity/lib/fetch";
import { urlFor } from "@/sanity/lib/image";
import type {
  BookingsCalendarBlock,
  Impostazioni,
  LudotecaBookingBlock,
  PartyPackagesBlock,
  ServicesListBlock,
} from "@/types";

/**
 * Blocchi che mostrano elenchi di documenti (servizi, eventi, pacchetti) e i
 * due blocchi di prenotazione.
 */

const CONTENITORE = "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8";

const linkLaterale = (href?: string | null, label?: string | null) =>
  label ? (
    <SmartLink
      href={href}
      className="text-sm font-extrabold text-lupetti-tealDark hover:text-lupetti-skyDark inline-flex items-center gap-1"
    >
      <span>{label}</span>
      <ArrowRight className="w-4 h-4" aria-hidden />
    </SmartLink>
  ) : undefined;

/* ------------------------------- Griglia servizi ------------------------------ */

const COLORI: Record<
  string,
  { scheda: string; badge: string; spunta: string; riga: string }
> = {
  teal: {
    scheda: "bg-lupetti-tealLight/40 border-lupetti-teal/20",
    badge: "text-lupetti-tealDark border-lupetti-teal/20",
    spunta: "text-lupetti-tealDark",
    riga: "border-lupetti-teal/15 text-lupetti-tealDark",
  },
  sky: {
    scheda: "bg-lupetti-skyLight/60 border-lupetti-sky/25",
    badge: "text-lupetti-skyDark border-lupetti-sky/25",
    spunta: "text-lupetti-skyDark",
    riga: "border-lupetti-sky/20 text-lupetti-skyDark",
  },
  pink: {
    scheda: "bg-lupetti-pinkLight border-lupetti-pink/30",
    badge: "text-pink-800 border-lupetti-pink/40",
    spunta: "text-pink-700",
    riga: "border-lupetti-pink/30 text-pink-800",
  },
  peach: {
    scheda: "bg-lupetti-peach/20 border-lupetti-peach/50",
    badge: "text-orange-900 border-lupetti-peach/60",
    spunta: "text-orange-800",
    riga: "border-lupetti-peach/50 text-orange-900",
  },
};

export function ServicesList({ item }: { item: ServicesListBlock }) {
  const servizi = item.servizi ?? [];
  if (servizi.length === 0) return null;

  return (
    <section className="py-14 sm:py-20 bg-white">
      <div className={CONTENITORE}>
        <SectionHeader
          tagline={item.tagline}
          heading={item.heading}
          aside={linkLaterale(item.cta?.href, item.cta?.label)}
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {servizi.map((servizio) => {
            const colore =
              COLORI[stegaClean(servizio.themeColor) || "teal"] ?? COLORI.teal;
            return (
              <article
                key={servizio._id}
                className={`rounded-md p-6 border flex flex-col justify-between ${colore.scheda}`}
              >
                <div>
                  {servizio.badge && (
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-extrabold bg-white border mb-3 ${colore.badge}`}
                    >
                      {servizio.badge}
                    </span>
                  )}
                  <h3 className="font-display text-xl font-bold text-slate-800">
                    {servizio.title}
                  </h3>
                  {servizio.description && (
                    <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                      {servizio.description}
                    </p>
                  )}
                  {servizio.features && servizio.features.length > 0 && (
                    <ul className="mt-4 space-y-2">
                      {servizio.features.map((punto, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 text-xs font-semibold text-slate-700"
                        >
                          <Check
                            aria-hidden
                            className={`w-3.5 h-3.5 shrink-0 mt-0.5 stroke-[3] ${colore.spunta}`}
                          />
                          <span>{punto}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                {servizio.priceInfo && (
                  <p
                    className={`mt-6 pt-4 border-t text-xs font-extrabold ${colore.riga}`}
                  >
                    {servizio.priceInfo}
                  </p>
                )}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ----------------------- Calendario laboratori ed eventi ---------------------- */

export async function BookingsCalendar({
  item,
  impostazioni,
  conAnnullamento,
}: {
  item: BookingsCalendarBlock;
  impostazioni: Impostazioni | null;
  /** Mostra sotto il riquadro per annullare (una volta sola per pagina). */
  conAnnullamento?: boolean;
}) {
  const regole = await getRegolePrenotazioni();
  const eventi = item.eventi ?? [];

  // Dati strutturati: Google può mostrare gli eventi nei risultati di ricerca.
  const jsonLd = eventi
    .filter((e) => e.title && e.inizio)
    .map((e) => ({
      "@context": "https://schema.org",
      "@type": "ChildrensEvent",
      name: stegaClean(e.title),
      startDate: e.inizio,
      ...(e.fine ? { endDate: e.fine } : {}),
      ...(e.descrizione ? { description: stegaClean(e.descrizione) } : {}),
      ...(e.immagine?.asset?._ref
        ? { image: urlFor(e.immagine).width(1200).url() }
        : {}),
      eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
      location: {
        "@type": "Place",
        name: impostazioni?.nomeAttivita || "I Lupetti",
        address: {
          "@type": "PostalAddress",
          streetAddress: impostazioni?.via,
          postalCode: impostazioni?.cap,
          addressLocality: impostazioni?.citta,
          addressRegion: impostazioni?.provincia,
          addressCountry: "IT",
        },
      },
      organizer: {
        "@type": "Organization",
        name: impostazioni?.nomeAttivita || "I Lupetti",
        url: siteUrl,
      },
    }));

  return (
    <section
      id="prenotazioni"
      className="py-14 sm:py-20 bg-gradient-to-b from-lupetti-skyLight/35 to-white border-t border-lupetti-sky/15 scroll-mt-24"
    >
      <div className={CONTENITORE}>
        <SectionHeader
          tagline={item.tagline}
          heading={item.heading}
          description={item.description}
          aside={linkLaterale(item.linkTutti?.href, item.linkTutti?.label)}
        />
        <EventsSection
          eventi={eventi}
          maxBambini={regole?.maxBambiniPerPrenotazione ?? 4}
          privacyHref={impostazioni?.privacyHref}
        />
        {conAnnullamento && <AnnullaPrenotazione />}
      </div>
      {jsonLd.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
          }}
        />
      )}
    </section>
  );
}

/* ------------------------- Prenotazione oraria ludoteca ------------------------ */

export async function LudotecaBooking({
  item,
  impostazioni,
  conAnnullamento,
}: {
  item: LudotecaBookingBlock;
  impostazioni: Impostazioni | null;
  conAnnullamento?: boolean;
}) {
  const regole = await getRegolePrenotazioni();

  return (
    <section
      id="ludoteca"
      className="py-14 sm:py-20 bg-gradient-to-b from-lupetti-tealLight/40 to-white scroll-mt-24"
    >
      <div className={CONTENITORE}>
        <SectionHeader
          tagline={item.tagline}
          heading={item.heading}
          description={item.description}
        />
        <LudotecaPrenotazione
          regole={regole}
          orari={impostazioni?.orari ?? null}
          privacyHref={impostazioni?.privacyHref}
        />
        {conAnnullamento && <AnnullaPrenotazione />}
      </div>
    </section>
  );
}

/* -------------------------------- Pacchetti feste ------------------------------ */

export function PartyPackages({
  item,
  impostazioni,
}: {
  item: PartyPackagesBlock;
  impostazioni: Impostazioni | null;
}) {
  const pacchetti = item.pacchetti ?? [];
  if (pacchetti.length === 0) return null;

  const etichetta = item.cta?.label || "Chiedi disponibilità";
  const destinazione = (nome?: string | null) =>
    item.cta?.href ||
    whatsappUrl(
      impostazioni?.whatsapp,
      `Ciao! Vorrei informazioni per una festa di compleanno${
        nome ? ` (pacchetto "${stegaClean(nome)}")` : ""
      }.`
    ) ||
    (impostazioni?.email ? `mailto:${impostazioni.email}` : "/");

  return (
    <section
      id="feste"
      className="py-14 sm:py-20 bg-gradient-to-b from-lupetti-pinkLight to-white scroll-mt-24"
    >
      <div className={CONTENITORE}>
        <SectionHeader
          tagline={item.tagline}
          heading={item.heading}
          description={item.description}
        />
        <div
          className={`grid grid-cols-1 gap-6 ${
            pacchetti.length >= 3 ? "md:grid-cols-3" : "md:grid-cols-2 max-w-4xl mx-auto"
          }`}
        >
          {pacchetti.map((p) => (
            <article
              key={p._id}
              className={`relative bg-white rounded-md p-6 sm:p-7 border flex flex-col ${
                p.inEvidenza
                  ? "border-lupetti-tealDark shadow-soft"
                  : "border-lupetti-pink/40 shadow-card"
              }`}
            >
              {p.inEvidenza && (
                <span className="absolute -top-3 left-6 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-lupetti-tealDark text-white text-xs font-extrabold">
                  <Star className="w-3 h-3 fill-current" aria-hidden />
                  Il più scelto
                </span>
              )}
              <h3 className="font-display text-xl font-bold text-slate-800">
                {p.nome}
              </h3>
              {p.prezzo && (
                <p className="font-display text-3xl font-bold text-lupetti-tealDark mt-2">
                  {p.prezzo}
                </p>
              )}
              {p.dettagli && (
                <p className="text-xs font-bold text-slate-600 mt-1">
                  {p.dettagli}
                </p>
              )}
              {p.descrizione && (
                <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                  {p.descrizione}
                </p>
              )}
              {p.incluso && p.incluso.length > 0 && (
                <ul className="mt-4 space-y-2 flex-1">
                  {p.incluso.map((voce, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm text-slate-700"
                    >
                      <Check
                        aria-hidden
                        className="w-4 h-4 shrink-0 mt-0.5 stroke-[3] text-lupetti-tealDark"
                      />
                      <span>{voce}</span>
                    </li>
                  ))}
                </ul>
              )}
              <SmartLink
                href={destinazione(p.nome)}
                className={`mt-6 ${p.inEvidenza ? "btn-pieno" : "btn-bordo"}`}
              >
                <MessageCircle className="w-4 h-4" aria-hidden />
                <span>{etichetta}</span>
              </SmartLink>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
