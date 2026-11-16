/**
 * Carica in Sanity i contenuti iniziali del sito (quelli che prima stavano in
 * Keystatic, dentro src/content).
 *
 *   npm run seed
 *
 * Si può rilanciare senza rischi: ogni documento ha un ID fisso e viene creato
 * solo se non esiste già, quindi le modifiche fatte nello Studio non vengono
 * mai sovrascritte. Utile anche per riempire un secondo dataset di prova.
 */
import { createReadStream } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { createClient } from "@sanity/client";

const {
  NEXT_PUBLIC_SANITY_PROJECT_ID: projectId,
  NEXT_PUBLIC_SANITY_DATASET: dataset,
  SANITY_API_WRITE_TOKEN: token,
} = process.env;

if (!projectId || !dataset || !token) {
  console.error(
    "Mancano le variabili Sanity. Compila .env.local (vedi .env.example)."
  );
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  token,
  apiVersion: "2025-02-19",
  useCdn: false,
});

const radice = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

/* --------------------------------- Utilità --------------------------------- */

let contatore = 0;
/** Chiave per gli elementi delle liste (Sanity la richiede). */
const k = () => `k${(++contatore).toString(36).padStart(4, "0")}`;

const ref = (id) => ({ _type: "reference", _ref: id });

/** Link a una pagina del sito, con sezione opzionale. */
const link = (label, pagina, ancora) => ({
  _type: "link",
  label,
  pagina: ref(`page-${pagina}`),
  ...(ancora ? { ancora } : {}),
});

/** Paragrafi di testo semplice → testo ricco di Sanity. */
const testo = (...paragrafi) =>
  paragrafi.map((t) => ({
    _type: "block",
    _key: k(),
    style: "normal",
    markDefs: [],
    children: [{ _type: "span", _key: k(), text: t, marks: [] }],
  }));

const blocco = (_type, campi) => ({ _type, _key: k(), ...campi });

const fascia = (dalle, alle) => ({ _type: "fasciaOraria", _key: k(), dalle, alle });

async function caricaImmagine(file) {
  const asset = await client.assets.upload(
    "image",
    createReadStream(path.join(radice, "public", "images", file)),
    { filename: path.basename(file) }
  );
  return { _type: "image", asset: ref(asset._id) };
}

/* -------------------------------- Contenuti -------------------------------- */

async function main() {
  console.log(`Dataset: ${projectId} / ${dataset}`);

  console.log("Carico le immagini…");
  const [mascotte, salaLudoteca, angoloMorbido, laboratorio, giochiFamiglia, scaffale] =
    await Promise.all(
      [
        "lupetti-mascot.png",
        "gallery/sala-ludoteca.svg",
        "gallery/angolo-morbido.svg",
        "gallery/laboratorio-pittura.svg",
        "gallery/giochi-famiglia.svg",
        "gallery/scaffale-giocattoli.svg",
      ].map(caricaImmagine)
    );

  const orarioFeriale = () => [fascia("09:00", "13:00"), fascia("15:30", "19:00")];

  const documenti = [
    /* ----------------------------- Impostazioni ---------------------------- */
    {
      _id: "impostazioni",
      _type: "impostazioni",
      nomeAttivita: "I Lupetti • Giocattoleria & Ludoteca Bologna",
      descrizioneBreve:
        "Giocattoleria educativa e ludoteca con laboratori creativi a numero chiuso e spazio gioco assistito.",
      telefono: "+39 051 0000000",
      whatsapp: "390510000000",
      email: "info@ilupettibologna.it",
      via: "Via Savigno, 1/a",
      cap: "40141",
      citta: "Bologna",
      provincia: "BO",
      indicazioni: "Parcheggio gratuito in strada disponibile nei dintorni.",
      orari: {
        _type: "orariSettimanali",
        lunedi: orarioFeriale(),
        martedi: orarioFeriale(),
        mercoledi: orarioFeriale(),
        giovedi: orarioFeriale(),
        venerdi: orarioFeriale(),
        sabato: orarioFeriale(),
        domenica: [],
      },
      infoUtili: [
        {
          _type: "infoUtile",
          _key: k(),
          icona: "Baby",
          titolo: "Servizi per i più piccoli",
          testo:
            "Struttura attrezzata con fasciatoio, baby parking e attività per diverse fasce d'età.",
        },
        {
          _type: "infoUtile",
          _key: k(),
          icona: "Car",
          titolo: "Parcheggio gratuito",
          testo:
            "Nei dintorni di Via Savigno 1/a è disponibile il parcheggio gratuito in strada.",
        },
        {
          _type: "infoUtile",
          _key: k(),
          icona: "CreditCard",
          titolo: "Metodi di pagamento",
          testo: "Si accettano carte di credito, carte di debito e bancomat.",
        },
      ],
      metaTitle: "I Lupetti • Giocattoleria & Ludoteca a Bologna (Via Savigno 1/a)",
      metaDescription:
        "I Lupetti è un negozio di giocattoli e ludoteca in Via Savigno 1/a a Bologna. Vendita giochi, baby parking e laboratori organizzati per diverse fasce d'età.",
    },
    {
      _id: "impostazioniPrenotazioni",
      _type: "impostazioniPrenotazioni",
      ludotecaAttiva: true,
      capienzaOraria: 15,
      maxOrePerPrenotazione: 3,
      maxBambiniPerPrenotazione: 4,
      anticipoMassimoGiorni: 30,
      preavvisoMinimoOre: 2,
      confermaAutomatica: true,
      mesiConservazione: 3,
    },
    {
      _id: "navigation",
      _type: "navigation",
      items: [
        { ...link("Home", "home"), _key: k() },
        { ...link("Chi Siamo & Spazi", "chi-siamo"), _key: k() },
        { ...link("Ludoteca & Prenotazioni", "ludoteca-e-laboratori"), _key: k() },
        { ...link("Orari & Contatti", "contatti"), _key: k() },
      ],
      cta: link("Prenota Posto", "ludoteca-e-laboratori", "ludoteca"),
    },

    /* -------------------------------- Pagine ------------------------------- */
    {
      _id: "page-home",
      _type: "page",
      title: "Home",
      slug: { _type: "slug", current: "home" },
      metaTitle: "I Lupetti • Giocattoleria & Ludoteca a Bologna (Via Savigno 1/a)",
      metaDescription:
        "I Lupetti è un negozio di giocattoli e ludoteca in Via Savigno 1/a a Bologna. Vendita giochi, baby parking e laboratori organizzati per diverse fasce d'età.",
      pageBuilder: [
        blocco("banner", {
          badge: "Giocattoleria ★ Ludoteca • Bologna",
          heading:
            "Il tuo spazio per il gioco, la crescita e la fantasia a Bologna.",
          subheading:
            "In Via Savigno 1/a trovi la nostra giocattoleria e ludoteca dedicata alle famiglie: vendita di giochi selezionati, servizio di baby parking e laboratori organizzati per diverse fasce d'età.",
          showLogoCard: true,
          cta: link("Prenota Laboratorio o Turno", "ludoteca-e-laboratori"),
          secondaryCta: link("Dove Siamo & Orari", "contatti"),
        }),
        blocco("quickActions", {
          actions: [
            {
              _type: "quickAction",
              _key: k(),
              icon: "CalendarCheck",
              link: link(
                "Prenota Turno / Laboratorio",
                "ludoteca-e-laboratori",
                "prenotazioni"
              ),
            },
            {
              _type: "quickAction",
              _key: k(),
              icon: "Puzzle",
              link: link(
                "Ludoteca & Baby Parking",
                "ludoteca-e-laboratori",
                "ludoteca"
              ),
            },
            {
              _type: "quickAction",
              _key: k(),
              icon: "Gift",
              link: link("Negozio di Giocattoli", "chi-siamo"),
            },
            {
              _type: "quickAction",
              _key: k(),
              icon: "MapPin",
              link: link("Via Savigno 1/a, Bologna", "contatti"),
            },
          ],
        }),
        blocco("servicesList", {
          tagline: "I Nostri Servizi per le Famiglie",
          heading: "Giocattoleria, Baby Parking & Laboratori",
          cta: link("Approfondisci e prenota", "ludoteca-e-laboratori"),
        }),
        blocco("bookingsCalendar", {
          tagline: "Prenotazioni Online a Numero Chiuso",
          heading: "Prossimi Laboratori e Turni in Programma",
          description:
            "Prenota direttamente online il posto per il tuo bambino: ogni laboratorio e turno in ludoteca è a numero chiuso.",
          onlyFeatured: true,
          linkTutti: link("Vedi tutti i turni", "ludoteca-e-laboratori"),
        }),
      ],
    },
    {
      _id: "page-chi-siamo",
      _type: "page",
      title: "Chi Siamo & Spazi",
      slug: { _type: "slug", current: "chi-siamo" },
      metaTitle: "Chi Siamo & Spazi | I Lupetti • Giocattoleria & Ludoteca Bologna",
      metaDescription:
        "Scopri I Lupetti in Via Savigno 1/a a Bologna: negozio di giocattoli e ludoteca attrezzata per i più piccoli con baby parking, fasciatoio e laboratori.",
      pageBuilder: [
        blocco("textWithIllustration", {
          tagline: "Via Savigno 1/a • Bologna",
          heading: "Uno spazio dedicato alle famiglie e ai più piccoli",
          text: testo(
            "I Lupetti è un negozio di giocattoli e ludoteca situato in Via Savigno, 1/a a Bologna (40141). La struttura nasce come uno spazio accogliente dedicato alle famiglie, offrendo sia la vendita di giochi selezionati sia servizi di ludoteca con baby parking e laboratori organizzati per diverse fasce d'età.",
            "La struttura è interamente attrezzata per accogliere anche i bambini più piccoli ed è dotata di fasciatoio e attività a loro dedicate. Nei dintorni è inoltre disponibile il comodo parcheggio gratuito in strada."
          ),
          image: mascotte,
          imagePosition: "right",
          backgroundStyle: "teal",
          cta: link("Scopri i Laboratori e Prenota", "ludoteca-e-laboratori"),
        }),
        blocco("gallery", {
          tagline: "Galleria",
          heading: "I Nostri Spazi e la Giocattoleria",
        }),
      ],
    },
    {
      _id: "page-ludoteca-e-laboratori",
      _type: "page",
      title: "Ludoteca & Laboratori",
      slug: { _type: "slug", current: "ludoteca-e-laboratori" },
      metaTitle: "Ludoteca, Laboratori & Prenotazioni a Numero Chiuso | I Lupetti",
      metaDescription:
        "Prenota online il tuo posto per i laboratori creativi e i turni a numero chiuso nella ludoteca I Lupetti.",
      pageBuilder: [
        blocco("ludotecaBooking", {
          tagline: "Ludoteca su prenotazione",
          heading: "Prenota la ludoteca",
          description:
            "Scegli il giorno e le ore che preferisci: ogni fascia oraria è a numero chiuso, così ogni bambino ha spazio e attenzione.",
        }),
        blocco("bookingsCalendar", {
          tagline: "Prenotazione Online a Numero Chiuso",
          heading: "Laboratori & Eventi in Programma",
          description:
            "Per garantire attenzione, sicurezza e tranquillità a ogni bambino, i nostri laboratori sono a numero chiuso. Scegli l'appuntamento e prenota il tuo posto.",
          onlyFeatured: false,
        }),
        blocco("separator", { line: true }),
        blocco("servicesList", {
          tagline: "I Nostri Spazi",
          heading: "Le Aree de I Lupetti",
        }),
      ],
    },
    {
      _id: "page-contatti",
      _type: "page",
      title: "Orari & Contatti",
      slug: { _type: "slug", current: "contatti" },
      metaTitle: "Orari & Contatti | I Lupetti • Via Savigno 1/a, Bologna",
      metaDescription:
        "Orari di apertura (Lun-Sab 09:00-13:00 e 15:30-19:00), indirizzo in Via Savigno 1/a a Bologna, parcheggio gratuito nei dintorni e contatti di I Lupetti.",
      pageBuilder: [
        blocco("map", {
          tagline: "Via Savigno, 1/a • 40141 Bologna (BO)",
          heading: "Orari di Apertura & Dove Siamo",
          subtitle:
            "Siamo aperti dal lunedì al sabato mattina e pomeriggio. Nei dintorni è disponibile il parcheggio gratuito in strada.",
          showForm: true,
        }),
        // Domande ricavate da informazioni già presenti sul sito.
        blocco("faq", {
          tagline: "Domande frequenti",
          heading: "Buono a sapersi",
          items: [
            {
              _type: "domandaRisposta",
              _key: k(),
              domanda: "Come si prenota la ludoteca?",
              risposta:
                "Dalla pagina «Ludoteca & Prenotazioni»: scegli il giorno, una o più ore di fila e inserisci i tuoi dati. Ricevi subito un codice di prenotazione.",
            },
            {
              _type: "domandaRisposta",
              _key: k(),
              domanda: "C'è parcheggio?",
              risposta:
                "Sì, nei dintorni di Via Savigno 1/a è disponibile il parcheggio gratuito in strada.",
            },
            {
              _type: "domandaRisposta",
              _key: k(),
              domanda: "La struttura è adatta ai più piccoli?",
              risposta:
                "Sì: è attrezzata per accogliere anche i bambini più piccoli, con fasciatoio e attività dedicate.",
            },
            {
              _type: "domandaRisposta",
              _key: k(),
              domanda: "Quali pagamenti accettate?",
              risposta: "Carte di credito, carte di debito e bancomat.",
            },
          ],
        }),
      ],
    },

    /* -------------------------------- Servizi ------------------------------ */
    {
      _id: "servizio-area-ludoteca",
      _type: "servizio",
      title: "Ludoteca & Baby Parking",
      badge: "Spazio Famiglie",
      themeColor: "teal",
      description:
        "Uno spazio sicuro e accogliente dedicato al gioco e alla socializzazione, con servizio di baby parking e ambienti attrezzati anche per i più piccoli.",
      priceInfo: "Accesso a turni e servizio Baby Parking",
      features: [
        "Servizio di ludoteca e baby parking con personale dedicato",
        "Struttura attrezzata per i più piccoli e dotata di fasciatoio",
        "Attività e aree gioco pensate per diverse fasce d'età",
        "Accesso su prenotazione a numero chiuso per la massima sicurezza",
      ],
      order: 1,
    },
    {
      _id: "servizio-angolo-giocattoleria",
      _type: "servizio",
      title: "Giocattoleria & Vendita Giochi",
      badge: "Tutte le Età",
      themeColor: "sky",
      description:
        "Un negozio di giocattoli selezionati con cura per accompagnare la crescita: giochi per la prima infanzia, creativi, in legno e da tavolo.",
      priceInfo: "Pagamenti con carte di credito e debito accettati",
      features: [
        "Giochi per la prima infanzia, costruzioni e giochi in legno",
        "Giochi da tavolo, puzzle e kit creativi per diverse fasce d'età",
        "Consulenza personalizzata in negozio per scegliere il regalo giusto",
        "Si accettano carte di credito, carte di debito e bancomat",
      ],
      order: 2,
    },
    {
      _id: "servizio-laboratori-creativi",
      _type: "servizio",
      title: "Laboratori per Fasce d'Età",
      badge: "Su Prenotazione",
      themeColor: "pink",
      description:
        "Laboratori creativi, espressivi e manuali organizzati per diverse fasce d'età, per stimolare fantasia e curiosità in piccoli gruppi.",
      priceInfo: "Prenotazione online a numero chiuso",
      features: [
        "Attività calibrate in base alle diverse fasce d'età dei bambini",
        "Piccoli gruppi a numero chiuso per seguire ogni partecipante",
        "Materiali didattici e creativi sempre inclusi",
        "Prenotazione semplice direttamente online sul sito",
      ],
      order: 3,
    },

    /* --------------------------- Laboratori ed eventi ---------------------- */
    // Orari italiani di fine novembre (UTC+1), salvati in UTC come fa Sanity.
    {
      _id: "evento-laboratorio-argilla",
      _type: "evento",
      title: "Piccoli Artisti: Modelliamo i Lupetti in Argilla",
      categoria: "Laboratorio",
      inizio: "2026-11-21T15:30:00.000Z",
      fine: "2026-11-21T17:00:00.000Z",
      fasciaEta: "4 – 9 anni",
      prezzo: "12€ (materiali inclusi)",
      descrizione:
        "Un pomeriggio con le mani in pasta! I bambini impareranno a modellare e dipingere con argilla naturale autoindurente il loro cucciolo del bosco da portare a casa.",
      immagine: laboratorio,
      inEvidenza: true,
      prenotabile: true,
      capienza: 10,
      ludotecaDuranteEvento: "chiusa",
    },
    {
      _id: "evento-letture-animate-bosco",
      _type: "evento",
      title: "Letture Animate nel Bosco Incantato",
      categoria: "Evento speciale",
      inizio: "2026-11-25T16:00:00.000Z",
      fine: "2026-11-25T17:15:00.000Z",
      fasciaEta: "2 – 6 anni",
      prezzo: "10€ a bambino",
      descrizione:
        "Tappeti morbidi e cuscini per viaggiare con la fantasia tra albi illustrati sonorizzati dal vivo, seguiti da un piccolo laboratorio espressivo.",
      immagine: angoloMorbido,
      inEvidenza: true,
      prenotabile: true,
      capienza: 8,
      ludotecaDuranteEvento: "chiusa",
    },
    {
      _id: "evento-giochi-tavolo-cooperativi",
      _type: "evento",
      title: "Pomeriggio Giochi da Tavolo Cooperativi",
      categoria: "Evento speciale",
      inizio: "2026-11-27T15:30:00.000Z",
      fine: "2026-11-27T17:30:00.000Z",
      fasciaEta: "5 – 11 anni",
      prezzo: "8€ a bambino",
      descrizione:
        "Apriamo le scatole più belle della nostra giocattoleria! Il nostro staff guiderà i bambini alla scoperta di nuovi giochi cooperativi, di abilità e strategia.",
      immagine: giochiFamiglia,
      inEvidenza: true,
      prenotabile: true,
      capienza: 12,
      ludotecaDuranteEvento: "chiusa",
    },

    /* ------------------------------ Galleria ------------------------------- */
    {
      _id: "foto-sala-ludoteca",
      _type: "foto",
      title: "La Grande Sala Giochi",
      categoria: "Spazi Ludoteca",
      didascalia:
        "Spazio luminoso con casette in legno, scivoli morbidi e pavimento antitrauma certificato.",
      immagine: salaLudoteca,
      order: 1,
    },
    {
      _id: "foto-angolo-morbido",
      _type: "foto",
      title: "Angolo Morbido & Letture (1-3 anni)",
      categoria: "Spazi Ludoteca",
      didascalia:
        "Un nido sicuro e accogliente per i cuccioli più piccoli con percorsi motori morbidi e libri tattili.",
      immagine: angoloMorbido,
      order: 3,
    },
    {
      _id: "foto-scaffale-giocattoli",
      _type: "foto",
      title: "Scaffali della Giocattoleria",
      categoria: "Giocattoleria",
      didascalia:
        "Giochi in legno certificato, costruzioni, puzzle d'autore e idee regalo selezionate per ogni età.",
      immagine: scaffale,
      order: 4,
    },
    {
      _id: "foto-laboratorio-pittura",
      _type: "foto",
      title: "Atelier dei Piccoli Creativi",
      categoria: "Laboratori",
      didascalia:
        "Il tavolo dei laboratori dove prendono forma disegni, sculture in argilla e lavoretti stagionali.",
      immagine: laboratorio,
      order: 5,
    },
    {
      _id: "foto-giochi-in-famiglia",
      _type: "foto",
      title: "Giochi da Tavolo & Sfide in Famiglia",
      categoria: "Giocattoleria",
      didascalia:
        "Dai primi giochi cooperativi a 3 anni fino ai grandi classici di strategia per bambini e ragazzi.",
      immagine: giochiFamiglia,
      order: 6,
    },

    /* --------------------- Esempi dei nuovi blocchi (BOZZE) --------------------
     * Documenti con ID "drafts.": si vedono solo nello Studio e nell'anteprima,
     * mai sul sito pubblico. Servono a mostrare i blocchi nuovi con testi
     * segnaposto: vanno completati con i dati veri prima di pubblicarli.
     */
    {
      _id: "drafts.page-feste-di-compleanno",
      _type: "page",
      title: "Feste di compleanno",
      slug: { _type: "slug", current: "feste-di-compleanno" },
      pageBuilder: [
        blocco("partyPackages", {
          tagline: "Feste di compleanno",
          heading: "Festeggia da I Lupetti",
          description:
            "ESEMPIO DA COMPLETARE: descrivi qui come funzionano le feste e modifica i pacchetti nella sezione «Pacchetti feste».",
        }),
        blocco("whatsappCta", {
          heading: "Vuoi una festa su misura?",
          text: "Scrivici: costruiamo insieme la festa giusta per il tuo bambino.",
          label: "Scrivici su WhatsApp",
          messaggio:
            "Ciao I Lupetti! Vorrei informazioni per una festa di compleanno.",
        }),
      ],
    },
    ...["Base", "Completo", "Esclusivo"].map((nome, i) => ({
      _id: `drafts.pacchetto-esempio-${i + 1}`,
      _type: "pacchettoFesta",
      nome: `Pacchetto ${nome} (esempio)`,
      prezzo: "da definire",
      dettagli: "Durata e numero di bambini da definire",
      descrizione:
        "ESEMPIO DA COMPLETARE: sostituisci con la descrizione del pacchetto.",
      incluso: ["Prima voce inclusa", "Seconda voce inclusa", "Terza voce inclusa"],
      inEvidenza: i === 1,
      order: i + 1,
    })),

    /* ----------------------------- Uso interno ----------------------------- */
    // "Lucchetto" usato per non assegnare lo stesso posto a due famiglie.
    { _id: "sistema.lock-prenotazioni", _type: "lockPrenotazioni", n: 0 },
  ];

  const transazione = client.transaction();
  for (const doc of documenti) transazione.createIfNotExists(doc);
  const esito = await transazione.commit();

  const creati = esito.results.filter((r) => r.operation === "create").length;
  console.log(
    `Fatto: ${creati} documenti creati, ${documenti.length - creati} già presenti (lasciati come sono).`
  );
}

main().catch((err) => {
  console.error("Caricamento non riuscito:", err.message || err);
  process.exit(1);
});
