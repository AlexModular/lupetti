import { stegaClean } from "@sanity/client/stega";
import {
  Cake,
  CalendarCheck,
  ChevronDown,
  Gift,
  MapPin,
  MessageCircle,
  Palette,
  Phone,
  Puzzle,
  Star,
  type LucideIcon,
} from "lucide-react";

import RichText from "@/components/RichText";
import SanityImage from "@/components/SanityImage";
import SectionHeader from "@/components/SectionHeader";
import SmartLink from "@/components/SmartLink";
import { whatsappUrl } from "@/lib/sito";
import type {
  BrandsBlock,
  FaqBlock,
  PromotionBlock,
  QuickActionsBlock,
  RichTextBlock,
  SeparatorBlock,
  TestimonialsBlock,
  VideoBlock,
  WhatsappCtaBlock,
} from "@/types";

/**
 * Blocchi "semplici": solo testo e immagini, senza dati esterni né
 * interazioni. I blocchi più articolati hanno ciascuno il proprio file.
 */

const CONTENITORE = "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8";

/* -------------------------------- Testo libero ------------------------------- */

export function RichTextSection({ item }: { item: RichTextBlock }) {
  return (
    <section className="py-12 sm:py-16 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {item.heading && (
          <h2 className="font-display font-semibold uppercase tracking-wide text-lupetti-tealDark text-2xl sm:text-4xl mb-6 text-center text-balance">
            {item.heading}
          </h2>
        )}
        <RichText value={item.content} />
      </div>
    </section>
  );
}

/* ---------------------------- Riquadro promozionale --------------------------- */

export function Promotion({ item }: { item: PromotionBlock }) {
  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto rounded-md bg-gradient-to-r from-lupetti-tealLight via-lupetti-skyLight to-lupetti-tealLight/60 p-8 sm:p-10 border border-lupetti-teal/20 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="max-w-2xl">
          {item.badge && (
            <span className="inline-block px-3 py-1 rounded-full bg-white text-lupetti-tealDark text-xs font-extrabold uppercase tracking-wider mb-2">
              {item.badge}
            </span>
          )}
          {item.title && (
            <h2 className="font-display font-semibold uppercase tracking-wide text-lupetti-tealDark text-2xl sm:text-3xl text-balance">
              {item.title}
            </h2>
          )}
          {item.text && (
            <p className="text-sm sm:text-base text-slate-700 mt-2">{item.text}</p>
          )}
        </div>
        {item.cta?.label && (
          <SmartLink
            href={item.cta.href}
            className="btn-pieno shrink-0"
          >
            {item.cta.label}
          </SmartLink>
        )}
      </div>
    </section>
  );
}

/* -------------------------------- Azioni rapide ------------------------------- */

const ICONE_AZIONI: Record<string, LucideIcon> = {
  CalendarCheck,
  Palette,
  Puzzle,
  Gift,
  Cake,
  MapPin,
  Phone,
};

export function QuickActions({ item }: { item: QuickActionsBlock }) {
  const azioni = (item.actions ?? []).filter((a) => a.link?.label);
  if (azioni.length === 0) return null;

  return (
    <section className="border-y border-lupetti-teal/15 bg-white">
      <div
        className={`max-w-7xl mx-auto grid grid-cols-2 ${
          azioni.length >= 4 ? "md:grid-cols-4" : "md:grid-cols-3"
        } divide-x divide-y md:divide-y-0 divide-lupetti-teal/15`}
      >
        {azioni.map((azione, i) => {
          const Icona =
            ICONE_AZIONI[stegaClean(azione.icon) || ""] ?? CalendarCheck;
          return (
            <SmartLink
              key={azione._key}
              href={azione.link?.href}
              className="flex items-center justify-center gap-3 py-5 px-4 hover:bg-lupetti-tealLight/30 transition-colors group"
            >
              <Icona
                aria-hidden
                className={`w-5 h-5 shrink-0 transition-transform duration-300 group-hover:scale-110 ${
                  i % 2 ? "text-lupetti-skyDark" : "text-lupetti-tealDark"
                }`}
              />
              <span className="font-display font-bold text-xs sm:text-sm text-slate-700 group-hover:text-lupetti-tealDark">
                {azione.link?.label}
              </span>
            </SmartLink>
          );
        })}
      </div>
    </section>
  );
}

/* --------------------------------- Separatore -------------------------------- */

export function Separator({ item }: { item: SeparatorBlock }) {
  return (
    <div className={`${CONTENITORE} py-4`}>
      {item.line !== false && <hr className="border-t border-lupetti-teal/15" />}
    </div>
  );
}

/* ----------------------------------- Video ----------------------------------- */

/** Accetta anche il link normale di YouTube e lo trasforma in quello da incorporare. */
function urlVideo(url: string) {
  const youtube =
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/.exec(
      url
    );
  // youtube-nocookie non salva cookie finché non si avvia il video.
  return youtube ? `https://www.youtube-nocookie.com/embed/${youtube[1]}` : url;
}

export function Video({ item }: { item: VideoBlock }) {
  const url = stegaClean(item.videoUrl);
  if (!url) return null;
  const file = /\.(mp4|webm)(\?.*)?$/i.test(url);

  return (
    <section className="py-14 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {item.title && (
          <h2 className="titolo-sezione mb-8 text-center">
            {item.title}
          </h2>
        )}
        <div className="rounded-md overflow-hidden border border-lupetti-teal/20 shadow-card aspect-video bg-slate-900">
          {file ? (
            <video src={url} controls preload="metadata" className="w-full h-full" />
          ) : (
            <iframe
              src={urlVideo(url)}
              title={stegaClean(item.title) || "Video"}
              loading="lazy"
              className="w-full h-full border-0"
              allow="accelerometer; encrypted-media; picture-in-picture"
              allowFullScreen
            />
          )}
        </div>
      </div>
    </section>
  );
}

/* ----------------------------------- Marchi ---------------------------------- */

export function Brands({ item }: { item: BrandsBlock }) {
  const marchi = (item.brands ?? []).filter((m) => m.nome);
  if (marchi.length === 0) return null;

  return (
    <section className="py-12 bg-white border-y border-lupetti-teal/10">
      <div className={CONTENITORE}>
        {item.heading && (
          <h2 className="font-display font-semibold uppercase tracking-wide text-lupetti-tealDark text-xl sm:text-2xl text-center mb-7">
            {item.heading}
          </h2>
        )}
        <ul className="flex flex-wrap items-center justify-center gap-x-8 gap-y-5">
          {marchi.map((marchio) => (
            <li key={marchio._key}>
              {marchio.logo?.asset?._ref ? (
                <SanityImage
                  image={marchio.logo}
                  alt={marchio.nome || ""}
                  width={280}
                  sizes="140px"
                  className="h-12 w-auto max-w-[140px] object-contain"
                />
              ) : (
                <span className="px-4 py-2 rounded-full bg-lupetti-tealLight/60 font-display font-bold text-slate-700">
                  {marchio.nome}
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* --------------------------------- Recensioni -------------------------------- */

export function Testimonials({ item }: { item: TestimonialsBlock }) {
  const recensioni = (item.items ?? []).filter((r) => r.testo);
  if (recensioni.length === 0) return null;

  return (
    <section className="py-14 sm:py-20 bg-gradient-to-b from-lupetti-skyLight/35 to-white">
      <div className={CONTENITORE}>
        <SectionHeader
          tagline={item.tagline}
          heading={item.heading}
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {recensioni.map((r) => {
            const stelle = Math.min(5, Math.max(1, r.stelle ?? 5));
            return (
              <figure
                key={r._key}
                className="bg-white rounded-md p-6 border border-lupetti-sky/20 shadow-card flex flex-col"
              >
                <div
                  className="flex gap-0.5 mb-3"
                  role="img"
                  aria-label={`${stelle} stelle su 5`}
                >
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star
                      key={i}
                      aria-hidden
                      className={`w-4 h-4 ${
                        i < stelle
                          ? "fill-amber-400 text-amber-400"
                          : "text-slate-200"
                      }`}
                    />
                  ))}
                </div>
                <blockquote className="text-sm text-slate-700 leading-relaxed flex-1">
                  “{r.testo}”
                </blockquote>
                <figcaption className="mt-4 text-sm">
                  <span className="font-display font-bold text-slate-800">
                    {r.autore}
                  </span>
                  {r.dettaglio && (
                    <span className="text-slate-500"> · {r.dettaglio}</span>
                  )}
                </figcaption>
              </figure>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------ Domande frequenti ----------------------------- */

export function Faq({ item }: { item: FaqBlock }) {
  const domande = (item.items ?? []).filter((d) => d.domanda && d.risposta);
  if (domande.length === 0) return null;

  // Dati strutturati: Google può mostrare domande e risposte nei risultati.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: domande.map((d) => ({
      "@type": "Question",
      name: stegaClean(d.domanda),
      acceptedAnswer: { "@type": "Answer", text: stegaClean(d.risposta) },
    })),
  };

  return (
    <section id="faq" className="py-14 sm:py-20 bg-white scroll-mt-28">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          tagline={item.tagline}
          heading={item.heading}
        />
        <div className="space-y-3">
          {domande.map((d) => (
            <details
              key={d._key}
              className="group rounded border border-lupetti-teal/20 bg-lupetti-tealLight/20 open:bg-white open:shadow-card transition-colors"
            >
              <summary className="flex items-center justify-between gap-4 cursor-pointer list-none px-5 py-4 font-display font-bold text-slate-800 [&::-webkit-details-marker]:hidden">
                <span>{d.domanda}</span>
                <ChevronDown
                  aria-hidden
                  className="w-5 h-5 shrink-0 text-lupetti-tealDark transition-transform group-open:rotate-180"
                />
              </summary>
              <p className="px-5 pb-5 text-sm sm:text-base text-slate-600 leading-relaxed whitespace-pre-line">
                {d.risposta}
              </p>
            </details>
          ))}
        </div>
      </div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
    </section>
  );
}

/* ------------------------------ Invito su WhatsApp ----------------------------- */

export function WhatsappCta({
  item,
  whatsapp,
}: {
  item: WhatsappCtaBlock;
  whatsapp?: string | null;
}) {
  const url = whatsappUrl(whatsapp, stegaClean(item.messaggio) || undefined);
  if (!url) return null;

  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto rounded-md bg-emerald-50 border border-emerald-200 p-8 sm:p-10 text-center">
        {item.heading && (
          <h2 className="font-display font-semibold uppercase tracking-wide text-lupetti-tealDark text-2xl sm:text-3xl text-balance">
            {item.heading}
          </h2>
        )}
        {item.text && (
          <p className="mt-2 text-slate-700 max-w-xl mx-auto">{item.text}</p>
        )}
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex items-center gap-2 px-6 py-3.5 rounded bg-emerald-700 hover:bg-emerald-800 text-white font-display font-bold transition-colors shadow-sm"
        >
          <MessageCircle className="w-5 h-5" aria-hidden />
          <span>{item.label || "Scrivici su WhatsApp"}</span>
        </a>
      </div>
    </section>
  );
}
