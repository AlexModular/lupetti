import { defineQuery } from "next-sanity";

/**
 * Trasforma un oggetto "link" in { label, href } pronto per il sito.
 * - indirizzo esterno, se presente
 * - altrimenti la pagina scelta ("/" per la home) più l'eventuale #sezione
 */
const LINK = `{
  _key,
  label,
  "href": select(
    defined(urlEsterno) => urlEsterno,
    defined(pagina) => select(
      pagina->slug.current == "home" => "/",
      "/" + pagina->slug.current
    ) + select(defined(ancora) => "#" + ancora, ""),
    defined(ancora) => "#" + ancora
  )
}`;

const EVENTO = `{
  _id, title, categoria, inizio, fine, fasciaEta, prezzo, descrizione,
  immagine, inEvidenza, prenotabile, capienza
}`;

/**
 * Blocchi della pagina. "..." prende tutti i campi del blocco; sotto si
 * aggiungono i link risolti e, per i blocchi che mostrano elenchi, i documenti
 * collegati (servizi, eventi, foto, pacchetti).
 */
const PAGE_BUILDER = `pageBuilder[]{
  ...,
  _type == "banner" => { cta ${LINK}, secondaryCta ${LINK} },
  _type == "textWithIllustration" => { cta ${LINK} },
  _type == "promotion" => { cta ${LINK} },
  _type == "quickActions" => { actions[]{ _key, icon, link ${LINK} } },
  _type == "servicesList" => {
    cta ${LINK},
    "servizi": *[_type == "servizio"] | order(order asc, title asc) {
      _id, title, badge, themeColor, description, priceInfo, features
    }
  },
  _type == "bookingsCalendar" => {
    linkTutti ${LINK},
    "eventi": *[
      _type == "evento" && fine > now()
      && (^.onlyFeatured != true || inEvidenza == true)
    ] | order(inizio asc) ${EVENTO}
  },
  _type == "partyPackages" => {
    cta ${LINK},
    "pacchetti": *[_type == "pacchettoFesta"] | order(order asc, nome asc) {
      _id, nome, prezzo, dettagli, descrizione, incluso, inEvidenza
    }
  },
  _type == "slideshow" => { images[]{ ..., cta ${LINK} } },
  _type == "gallery" => {
    "foto": *[_type == "foto" && defined(immagine.asset)] | order(order asc, title asc) {
      _id, title, categoria, didascalia, immagine
    }
  }
}`;

export const PAGE_QUERY = defineQuery(`*[_type == "page" && slug.current == $slug][0]{
  _id,
  _type,
  title,
  subtitle,
  "slug": slug.current,
  metaTitle,
  metaDescription,
  introImage,
  ${PAGE_BUILDER}
}`);

export const PAGE_SLUGS_QUERY = defineQuery(
  `*[_type == "page" && defined(slug.current)]{ "slug": slug.current, _updatedAt }`
);

/** Impostazioni e menu: servono a tutte le pagine (testata, piè di pagina). */
export const SITE_QUERY = defineQuery(`{
  "impostazioni": *[_id == "impostazioni"][0]{
    nomeAttivita, descrizioneBreve, telefono, whatsapp, email,
    via, cap, citta, provincia, indicazioni, instagramUrl, facebookUrl,
    orari, notaOrari, infoUtili[]{ _key, icona, titolo, testo },
    metaTitle, metaDescription, ogImage,
    "privacyHref": "/" + paginaPrivacy->slug.current
  },
  "navigation": *[_id == "navigation"][0]{
    items[] ${LINK},
    cta ${LINK}
  }
}`);

/** Regole di prenotazione mostrate al pubblico (niente dati riservati). */
export const REGOLE_QUERY = defineQuery(`*[_id == "impostazioniPrenotazioni"][0]{
  ludotecaAttiva, capienzaOraria, prezzoInfo, maxOrePerPrenotazione,
  maxBambiniPerPrenotazione, anticipoMassimoGiorni, preavvisoMinimoOre,
  confermaAutomatica,
  eccezioni[]{ data, chiuso, capienza, nota }
}`);
