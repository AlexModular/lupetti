import { createDataAttribute } from "next-sanity";
import type { ReactNode } from "react";

import { dataset, projectId, studioUrl } from "@/sanity/env";
import type { Blocco, Impostazioni, Pagina } from "@/types";

import Banner from "./blocks/Banner";
import Contatti from "./blocks/Contatti";
import {
  BookingsCalendar,
  LudotecaBooking,
  PartyPackages,
  ServicesList,
} from "./blocks/Elenchi";
import { Gallery, Slider } from "./blocks/Gallery";
import {
  Brands,
  Faq,
  Promotion,
  QuickActions,
  RichTextSection,
  Separator,
  Testimonials,
  Video,
  WhatsappCta,
} from "./blocks/Semplici";
import Slideshow from "./blocks/Slideshow";
import TextWithIllustration from "./blocks/TextWithIllustration";

/** Sceglie il componente giusto per ogni blocco del page builder. */
function makeBlock(
  item: Blocco,
  impostazioni: Impostazioni | null,
  conAnnullamento: boolean
): ReactNode {
  switch (item._type) {
    case "banner":
      return <Banner item={item} />;
    case "textWithIllustration":
      return <TextWithIllustration item={item} />;
    case "richText":
      return <RichTextSection item={item} />;
    case "promotion":
      return <Promotion item={item} />;
    case "quickActions":
      return <QuickActions item={item} />;
    case "separator":
      return <Separator item={item} />;
    case "bookingsCalendar":
      return (
        <BookingsCalendar
          item={item}
          impostazioni={impostazioni}
          conAnnullamento={conAnnullamento}
        />
      );
    case "ludotecaBooking":
      return (
        <LudotecaBooking
          item={item}
          impostazioni={impostazioni}
          conAnnullamento={conAnnullamento}
        />
      );
    case "partyPackages":
      return <PartyPackages item={item} impostazioni={impostazioni} />;
    case "servicesList":
      return <ServicesList item={item} />;
    case "gallery":
      return <Gallery item={item} />;
    case "slideshow":
      return <Slideshow item={item} />;
    case "slider":
      return <Slider item={item} />;
    case "video":
      return <Video item={item} />;
    case "brands":
      return <Brands item={item} />;
    case "testimonials":
      return <Testimonials item={item} />;
    case "map":
      return <Contatti item={item} impostazioni={impostazioni} />;
    case "faq":
      return <Faq item={item} />;
    case "whatsappCta":
      return <WhatsappCta item={item} whatsapp={impostazioni?.whatsapp} />;
    default:
      return null;
  }
}

interface PageMakerProps {
  page: Pagina;
  impostazioni: Impostazioni | null;
  /**
   * In anteprima ogni blocco viene "etichettato": così nello strumento
   * Anteprima dello Studio si può cliccare un blocco per modificarlo e
   * trascinarlo per spostarlo.
   */
  anteprima?: boolean;
}

export default function PageMaker({
  page,
  impostazioni,
  anteprima = false,
}: PageMakerProps) {
  const blocchi = page.pageBuilder ?? [];
  // Il riquadro "annulla una prenotazione" compare una volta sola, sotto
  // l'ultimo blocco di prenotazione della pagina.
  const ultimoDiPrenotazione = blocchi.findLast(
    (b) => b._type === "bookingsCalendar" || b._type === "ludotecaBooking"
  )?._key;

  const etichetta = (path: string) =>
    anteprima
      ? createDataAttribute({
          projectId,
          dataset,
          baseUrl: studioUrl,
          id: page._id,
          type: page._type,
          path,
        }).toString()
      : undefined;

  return (
    <div
      className={page.slug === "home" ? "homepage" : "page-content"}
      data-sanity={etichetta("pageBuilder")}
    >
      {blocchi.map((item, i) => (
        <div
          key={item._key}
          // Dal secondo blocco in giù: compare con una dissolvenza allo scorrimento.
          data-reveal={i > 0 ? "" : undefined}
          data-sanity={etichetta(`pageBuilder[_key=="${item._key}"]`)}
        >
          {makeBlock(item, impostazioni, item._key === ultimoDiPrenotazione)}
        </div>
      ))}
    </div>
  );
}
