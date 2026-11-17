import type { PortableTextBlock } from "next-sanity";

import type { OrariSettimanali } from "@/lib/orari";

/** Immagine come arriva da Sanity (con ritaglio e punto focale). */
export interface SanityImageValue {
  _type?: "image";
  asset?: { _ref: string; _type?: "reference" };
  hotspot?: { x: number; y: number; height: number; width: number };
  crop?: { top: number; bottom: number; left: number; right: number };
}

/** Link già risolto dalla query: `href` è pronto per essere usato. */
export interface LinkValue {
  _key?: string | null;
  label?: string | null;
  href?: string | null;
}

export interface Impostazioni {
  nomeAttivita?: string | null;
  descrizioneBreve?: string | null;
  telefono?: string | null;
  whatsapp?: string | null;
  email?: string | null;
  via?: string | null;
  cap?: string | null;
  citta?: string | null;
  provincia?: string | null;
  indicazioni?: string | null;
  instagramUrl?: string | null;
  facebookUrl?: string | null;
  orari?: OrariSettimanali | null;
  notaOrari?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  ogImage?: SanityImageValue | null;
  privacyHref?: string | null;
}

export interface Navigation {
  items?: LinkValue[] | null;
  cta?: LinkValue | null;
}

export interface Eccezione {
  data: string;
  chiuso?: boolean | null;
  capienza?: number | null;
  nota?: string | null;
}

/** Regole di prenotazione (documento "impostazioniPrenotazioni"). */
export interface RegolePrenotazioni {
  ludotecaAttiva?: boolean | null;
  capienzaOraria?: number | null;
  prezzoInfo?: string | null;
  maxOrePerPrenotazione?: number | null;
  maxBambiniPerPrenotazione?: number | null;
  anticipoMassimoGiorni?: number | null;
  preavvisoMinimoOre?: number | null;
  confermaAutomatica?: boolean | null;
  eccezioni?: Eccezione[] | null;
}

export interface Servizio {
  _id: string;
  title?: string | null;
  badge?: string | null;
  themeColor?: string | null;
  description?: string | null;
  priceInfo?: string | null;
  features?: string[] | null;
}

export interface Evento {
  _id: string;
  title?: string | null;
  categoria?: string | null;
  inizio?: string | null;
  fine?: string | null;
  fasciaEta?: string | null;
  prezzo?: string | null;
  descrizione?: string | null;
  immagine?: SanityImageValue | null;
  inEvidenza?: boolean | null;
  prenotabile?: boolean | null;
  capienza?: number | null;
}

export interface Foto {
  _id: string;
  title?: string | null;
  categoria?: string | null;
  didascalia?: string | null;
  immagine?: SanityImageValue | null;
}

export interface PacchettoFesta {
  _id: string;
  nome?: string | null;
  prezzo?: string | null;
  dettagli?: string | null;
  descrizione?: string | null;
  incluso?: string[] | null;
  inEvidenza?: boolean | null;
}

/* --------------------------- Blocchi del page builder --------------------------- */

interface BloccoBase<T extends string> {
  _type: T;
  _key: string;
}

interface Intestazione {
  tagline?: string | null;
  heading?: string | null;
}

export interface BannerBlock extends BloccoBase<"banner"> {
  badge?: string | null;
  heading?: string | null;
  subheading?: string | null;
  showLogoCard?: boolean | null;
  image?: SanityImageValue | null;
  cta?: LinkValue | null;
  secondaryCta?: LinkValue | null;
}

export interface TextWithIllustrationBlock
  extends BloccoBase<"textWithIllustration">,
    Intestazione {
  text?: PortableTextBlock[] | null;
  image?: SanityImageValue | null;
  imagePosition?: string | null;
  backgroundStyle?: string | null;
  cta?: LinkValue | null;
}

export interface RichTextBlock extends BloccoBase<"richText"> {
  heading?: string | null;
  content?: PortableTextBlock[] | null;
}

export interface PromotionBlock extends BloccoBase<"promotion"> {
  badge?: string | null;
  title?: string | null;
  text?: string | null;
  cta?: LinkValue | null;
}

export interface QuickActionsBlock extends BloccoBase<"quickActions"> {
  actions?:
    | { _key: string; icon?: string | null; link?: LinkValue | null }[]
    | null;
}

export interface SeparatorBlock extends BloccoBase<"separator"> {
  line?: boolean | null;
}

export interface BookingsCalendarBlock
  extends BloccoBase<"bookingsCalendar">,
    Intestazione {
  description?: string | null;
  onlyFeatured?: boolean | null;
  linkTutti?: LinkValue | null;
  eventi?: Evento[] | null;
}

export interface LudotecaBookingBlock
  extends BloccoBase<"ludotecaBooking">,
    Intestazione {
  description?: string | null;
}

export interface PartyPackagesBlock
  extends BloccoBase<"partyPackages">,
    Intestazione {
  description?: string | null;
  cta?: LinkValue | null;
  pacchetti?: PacchettoFesta[] | null;
}

export interface ServicesListBlock
  extends BloccoBase<"servicesList">,
    Intestazione {
  cta?: LinkValue | null;
  servizi?: Servizio[] | null;
}

export interface GalleryBlock extends BloccoBase<"gallery">, Intestazione {
  foto?: Foto[] | null;
}

export interface SlideshowBlock extends BloccoBase<"slideshow"> {
  images?:
    | (SanityImageValue & {
        _key: string;
        heading?: string | null;
        subtitle?: string | null;
        alt?: string | null;
        cta?: LinkValue | null;
      })[]
    | null;
}

export interface SliderBlock extends BloccoBase<"slider"> {
  heading?: string | null;
  slides?:
    | {
        _key: string;
        title?: string | null;
        caption?: string | null;
        image?: SanityImageValue | null;
      }[]
    | null;
}

export interface VideoBlock extends BloccoBase<"video"> {
  title?: string | null;
  videoUrl?: string | null;
}

export interface BrandsBlock extends BloccoBase<"brands"> {
  heading?: string | null;
  brands?:
    | { _key: string; nome?: string | null; logo?: SanityImageValue | null }[]
    | null;
}

export interface TestimonialsBlock
  extends BloccoBase<"testimonials">,
    Intestazione {
  items?:
    | {
        _key: string;
        testo?: string | null;
        autore?: string | null;
        dettaglio?: string | null;
        stelle?: number | null;
      }[]
    | null;
}

export interface MapBlock extends BloccoBase<"map">, Intestazione {
  subtitle?: string | null;
  showForm?: boolean | null;
}

export interface FaqBlock extends BloccoBase<"faq">, Intestazione {
  items?:
    | { _key: string; domanda?: string | null; risposta?: string | null }[]
    | null;
}

export interface WhatsappCtaBlock extends BloccoBase<"whatsappCta"> {
  heading?: string | null;
  text?: string | null;
  label?: string | null;
  messaggio?: string | null;
}

export type Blocco =
  | BannerBlock
  | TextWithIllustrationBlock
  | RichTextBlock
  | PromotionBlock
  | QuickActionsBlock
  | SeparatorBlock
  | BookingsCalendarBlock
  | LudotecaBookingBlock
  | PartyPackagesBlock
  | ServicesListBlock
  | GalleryBlock
  | SlideshowBlock
  | SliderBlock
  | VideoBlock
  | BrandsBlock
  | TestimonialsBlock
  | MapBlock
  | FaqBlock
  | WhatsappCtaBlock;

export interface Pagina {
  _id: string;
  _type: "page";
  title?: string | null;
  subtitle?: string | null;
  slug?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  introImage?: SanityImageValue | null;
  pageBuilder?: Blocco[] | null;
}

/* ------------------------- Risposte delle API prenotazioni ------------------------ */

export type StatoSlot = "disponibile" | "pieno" | "chiuso" | "non_prenotabile";

export interface SlotDisponibilita {
  ora: string;
  fine: string;
  capienza: number;
  rimasti: number;
  stato: StatoSlot;
  /** Spiegazione breve quando la fascia non è prenotabile. */
  nota?: string;
}

export interface DisponibilitaLudoteca {
  data: string;
  aperta: boolean;
  /** Perché il giorno non è prenotabile (chiuso, ferie, troppo lontano…). */
  motivo?: string;
  slots: SlotDisponibilita[];
}

export interface DisponibilitaEvento {
  id: string;
  capienza: number;
  prenotati: number;
  rimasti: number;
  /** false se l'evento è già iniziato o non accetta prenotazioni online. */
  aperto: boolean;
}

export interface EsitoPrenotazione {
  codice: string;
  stato: "confermata" | "in_attesa";
  bambini: number;
  /** Es. "Sabato 21 novembre · 16:30 – 18:30" */
  quando: string;
  /** Titolo dell'evento oppure "Ludoteca" */
  cosa: string;
}
