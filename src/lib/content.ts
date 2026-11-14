import { createReader } from "@keystatic/core/reader";
import keystaticConfig from "@keystatic-config";

export async function getSiteData() {
  const reader = createReader(process.cwd(), keystaticConfig);

  const [
    navigationRaw,
    impostazioniRaw,
    serviziRaw,
    eventiRaw,
    galleriaRaw,
  ] = await Promise.all([
    reader.singletons.navigation.read(),
    reader.singletons.impostazioni.read(),
    reader.collections.servizi.all(),
    reader.collections.eventi.all(),
    reader.collections.galleria.all(),
  ]);

  const navigation = navigationRaw ?? {
    items: [
      { label: "Home", href: "/" },
      { label: "Chi Siamo & Spazi", href: "/chi-siamo" },
      { label: "Ludoteca & Prenotazioni", href: "/ludoteca-e-laboratori" },
      { label: "Orari & Contatti", href: "/contatti" },
    ],
    ctaLabel: "Prenota Posto",
    ctaHref: "/ludoteca-e-laboratori#prenotazioni",
  };

  const impostazioni = impostazioniRaw ?? {
    nomeAttivita: "I Lupetti • Giocattoleria & Ludoteca",
    badgeHero: "Giocattoleria ★ Ludoteca",
    sloganHero: "Uno spazio pensato per crescere, scoprire e giocare insieme.",
    sottotitoloHero:
      "Da I Lupetti trovi una ludoteca accogliente con laboratori creativi a numero chiuso e gioco assistito, accanto a una giocattoleria selezionata con giochi in legno, educativi e da tavolo.",
    chiSiamoTitolo: "La tana dei piccoli esploratori",
    chiSiamoTesto1:
      "I Lupetti nasce dal desiderio di creare un luogo luminoso, tranquillo e a misura di bambino, dove il gioco torna ad essere scoperta, manualità e relazione.",
    chiSiamoTesto2:
      "Che si tratti di scegliere un gioco in legno, partecipare a un laboratorio creativo o giocare nella nostra ludoteca, accogliamo ogni famiglia con passione.",
    telefono: "+39 348 123 4567",
    whatsapp: "393481234567",
    email: "info@ilupettiludoteca.it",
    indirizzo: "Via delle Fiabe 24, Italia",
    indicazioniParcheggio:
      "Comodo parcheggio gratuito di fronte all'ingresso e accesso facilitato per passeggini.",
    orariMattina: "Mar – Sab: 09:30 – 13:00",
    orariPomeriggio: "Lun – Sab: 16:00 – 19:30",
    orariDomenica: "Domenica e Lunedì mattina chiuso",
    instagramUrl: "https://instagram.com",
    facebookUrl: "https://facebook.com",
  };

  const servizi = serviziRaw
    .map((item) => ({
      slug: item.slug,
      ...item.entry,
    }))
    .sort((a, b) => (a.order ?? 99) - (b.order ?? 99));

  const eventi = eventiRaw
    .map((item) => ({
      slug: item.slug,
      ...item.entry,
      maxCapacity: item.entry.maxCapacity ?? 10,
      image: item.entry.image || "/images/gallery/laboratorio-pittura.svg",
    }))
    .sort((a, b) => (a.order ?? 99) - (b.order ?? 99));

  const galleria = galleriaRaw
    .map((item) => ({
      slug: item.slug,
      ...item.entry,
      image: item.entry.image || "/images/gallery/sala-ludoteca.svg",
    }))
    .sort((a, b) => (a.order ?? 99) - (b.order ?? 99));

  return {
    navigation,
    impostazioni,
    servizi,
    eventi,
    galleria,
  };
}

export async function getPageBySlug(slug: string) {
  const reader = createReader(process.cwd(), keystaticConfig);
  const page = await reader.collections.pages.read(slug);
  if (!page) return null;
  return {
    slug,
    ...page,
  };
}

export async function getAllPageSlugs() {
  const reader = createReader(process.cwd(), keystaticConfig);
  return reader.collections.pages.list();
}
