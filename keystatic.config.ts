import { config, fields, collection, singleton } from "@keystatic/core";

const isGithubMode =
  Boolean(process.env.NEXT_PUBLIC_KEYSTATIC_GITHUB_OWNER) &&
  Boolean(process.env.NEXT_PUBLIC_KEYSTATIC_GITHUB_REPO);

export default config({
  storage: isGithubMode
    ? {
        kind: "github",
        repo: {
          owner: process.env.NEXT_PUBLIC_KEYSTATIC_GITHUB_OWNER!,
          name: process.env.NEXT_PUBLIC_KEYSTATIC_GITHUB_REPO!,
        },
      }
    : {
        kind: "local",
      },
  ui: {
    brand: {
      name: "I Lupetti CMS",
    },
    navigation: {
      "Page Builder & Menu": ["pages", "navigation", "impostazioni"],
      "Prenotazioni & Cataloghi": ["eventi", "servizi", "galleria"],
    },
  },
  singletons: {
    navigation: singleton({
      label: "Menu di Navigazione (Header)",
      path: "src/content/navigation/index",
      format: { data: "json" },
      schema: {
        items: fields.array(
          fields.object({
            label: fields.text({ label: "Testo voce menu" }),
            href: fields.text({ label: "Percorso URL (es. /chi-siamo)" }),
          }),
          {
            label: "Voci del Menu Principale",
            itemLabel: (props) =>
              `${props.fields.label.value || "Voce"} (${props.fields.href.value || "/"})`,
          }
        ),
        ctaLabel: fields.text({
          label: "Testo Bottone CTA Destra",
          defaultValue: "Prenota Posto",
        }),
        ctaHref: fields.text({
          label: "Link Bottone CTA Destra",
          defaultValue: "/ludoteca-e-laboratori#prenotazioni",
        }),
      },
    }),
    impostazioni: singleton({
      label: "Impostazioni Generali, Orari & Contatti",
      path: "src/content/impostazioni/index",
      format: { data: "json" },
      schema: {
        nomeAttivita: fields.text({
          label: "Nome Attività",
          defaultValue: "I Lupetti • Giocattoleria & Ludoteca",
        }),
        badgeHero: fields.text({
          label: "Badge Principale",
          defaultValue: "Giocattoleria ★ Ludoteca",
        }),
        sloganHero: fields.text({
          label: "Slogan",
          defaultValue: "Uno spazio pensato per crescere, scoprire e giocare insieme.",
        }),
        sottotitoloHero: fields.text({
          label: "Descrizione Breve (Footer / Default)",
          multiline: true,
          defaultValue:
            "Da I Lupetti trovi una ludoteca accogliente con laboratori creativi a numero chiuso e gioco assistito, accanto a una giocattoleria selezionata con giochi in legno, educativi e da tavolo.",
        }),
        chiSiamoTitolo: fields.text({
          label: "Titolo Chi Siamo",
          defaultValue: "La tana dei piccoli esploratori",
        }),
        chiSiamoTesto1: fields.text({
          label: "Chi Siamo - Paragrafo 1",
          multiline: true,
          defaultValue:
            "I Lupetti nasce dal desiderio di creare un luogo luminoso, tranquillo e a misura di bambino, dove il gioco torna ad essere scoperta, manualità e relazione.",
        }),
        chiSiamoTesto2: fields.text({
          label: "Chi Siamo - Paragrafo 2",
          multiline: true,
          defaultValue:
            "Che si tratti di scegliere un gioco in legno, partecipare a un laboratorio creativo o giocare nella nostra ludoteca, accogliamo ogni famiglia con semplicità e passione.",
        }),
        telefono: fields.text({
          label: "Telefono",
          defaultValue: "+39 348 123 4567",
        }),
        whatsapp: fields.text({
          label: "Numero WhatsApp (es. 393481234567)",
          defaultValue: "393481234567",
        }),
        email: fields.text({
          label: "Email di contatto",
          defaultValue: "info@ilupettiludoteca.it",
        }),
        indirizzo: fields.text({
          label: "Indirizzo completo",
          defaultValue: "Via delle Fiabe 24, Italia",
        }),
        indicazioniParcheggio: fields.text({
          label: "Info Parcheggio / Come raggiungerci",
          defaultValue: "Comodo parcheggio gratuito di fronte all'ingresso e accesso facilitato per passeggini.",
        }),
        orariMattina: fields.text({
          label: "Orari Mattina",
          defaultValue: "Mar – Sab: 09:30 – 13:00",
        }),
        orariPomeriggio: fields.text({
          label: "Orari Pomeriggio",
          defaultValue: "Lun – Sab: 16:00 – 19:30",
        }),
        orariDomenica: fields.text({
          label: "Chiusura settimanale",
          defaultValue: "Domenica e Lunedì mattina chiuso",
        }),
        instagramUrl: fields.text({
          label: "Link Instagram",
          defaultValue: "https://instagram.com",
        }),
        facebookUrl: fields.text({
          label: "Link Facebook",
          defaultValue: "https://facebook.com",
        }),
      },
    }),
  },
  collections: {
    pages: collection({
      label: "Pagine (Page Builder)",
      slugField: "title",
      path: "src/content/pages/*",
      format: { data: "json" },
      schema: {
        title: fields.slug({ name: { label: "Titolo Pagina" } }),
        subtitle: fields.text({
          label: "Sottotitolo Intro (opzionale)",
        }),
        metaTitle: fields.text({
          label: "SEO Meta Title",
        }),
        metaDescription: fields.text({
          label: "SEO Meta Description",
          multiline: true,
        }),
        introImage: fields.image({
          label: "Immagine Header Pagina (PageIntro opzionale)",
          directory: "public/images/gallery",
          publicPath: "/images/gallery/",
        }),
        fullWidth: fields.checkbox({
          label: "Layout Full Width",
          defaultValue: false,
        }),
        theme: fields.select({
          label: "Tema Sfondo Pagina",
          options: [
            { label: "Bianco Luminoso (Light)", value: "light" },
            { label: "Verde Acqua Delicato (Teal)", value: "teal" },
            { label: "Azzurro Cielo Delicato (Sky)", value: "sky" },
          ],
          defaultValue: "light",
        }),
        pageBuilder: fields.blocks(
          {
            banner: {
              label: "Hero / Banner",
              itemLabel: (props) =>
                `Banner: ${props.fields.heading.value || "Hero"}`,
              schema: fields.object({
                badge: fields.text({
                  label: "Badge sopra il titolo",
                  defaultValue: "Giocattoleria ★ Ludoteca",
                }),
                heading: fields.text({
                  label: "Titolo Principale",
                }),
                subheading: fields.text({
                  label: "Sottotitolo / Testo",
                  multiline: true,
                }),
                image: fields.image({
                  label: "Immagine o Logo (opzionale)",
                  directory: "public/images",
                  publicPath: "/images/",
                }),
                showLogoCard: fields.checkbox({
                  label: "Mostra Card con Logo I Lupetti a destra",
                  defaultValue: true,
                }),
                ctaLabel: fields.text({
                  label: "Testo Bottone Principale",
                  defaultValue: "Prenota Laboratorio o Turno",
                }),
                ctaHref: fields.text({
                  label: "Link Bottone Principale",
                  defaultValue: "/ludoteca-e-laboratori",
                }),
                secondaryCtaLabel: fields.text({
                  label: "Testo Secondo Bottone (opz.)",
                  defaultValue: "Scopri Chi Siamo",
                }),
                secondaryCtaHref: fields.text({
                  label: "Link Secondo Bottone (opz.)",
                  defaultValue: "/chi-siamo",
                }),
              }),
            },
            textWithIllustration: {
              label: "Testo con Immagine (TextWithIllustration)",
              itemLabel: (props) =>
                `Testo + Immagine: ${props.fields.heading.value || "Sezione"}`,
              schema: fields.object({
                tagline: fields.text({
                  label: "Occhiello / Tagline sopra il titolo",
                }),
                heading: fields.text({
                  label: "Titolo (Heading)",
                }),
                text: fields.text({
                  label: "Testo Principale",
                  multiline: true,
                }),
                secondaryText: fields.text({
                  label: "Secondo Paragrafo (opzionale)",
                  multiline: true,
                }),
                image: fields.image({
                  label: "Immagine / Illustrazione",
                  directory: "public/images",
                  publicPath: "/images/",
                }),
                imagePosition: fields.select({
                  label: "Posizione Immagine",
                  options: [
                    { label: "Destra (Right)", value: "right" },
                    { label: "Sinistra (Left)", value: "left" },
                    { label: "Sopra (Top)", value: "top" },
                    { label: "Sotto (Bottom)", value: "bottom" },
                  ],
                  defaultValue: "right",
                }),
                backgroundStyle: fields.select({
                  label: "Sfondo Sezione",
                  options: [
                    { label: "Bianco", value: "white" },
                    { label: "Verde Acqua Chiaro", value: "teal" },
                    { label: "Azzurro Chiaro", value: "sky" },
                  ],
                  defaultValue: "white",
                }),
                ctaLabel: fields.text({
                  label: "Testo Bottone (opzionale)",
                }),
                ctaHref: fields.text({
                  label: "Link Bottone (opzionale)",
                }),
              }),
            },
            quickActions: {
              label: "Barra Azioni Rapide (QuickActions)",
              itemLabel: () => "Barra QuickActions",
              schema: fields.object({
                actions: fields.array(
                  fields.object({
                    label: fields.text({ label: "Etichetta" }),
                    icon: fields.select({
                      label: "Icona",
                      options: [
                        { label: "Calendario Prenotazioni", value: "CalendarCheck" },
                        { label: "Tavolozza Laboratori", value: "Palette" },
                        { label: "Puzzle Ludoteca", value: "Puzzle" },
                        { label: "Regalo Giocattoleria", value: "Gift" },
                        { label: "Mappa / Posizione", value: "MapPin" },
                        { label: "Telefono", value: "Phone" },
                      ],
                      defaultValue: "CalendarCheck",
                    }),
                    href: fields.text({ label: "Link (es. /ludoteca-e-laboratori)" }),
                  }),
                  {
                    label: "Azioni Rapide",
                    itemLabel: (props) => props.fields.label.value || "Azione",
                  }
                ),
              }),
            },
            servicesList: {
              label: "Griglia Aree & Servizi (Ludoteca / Giocattoleria)",
              itemLabel: (props) =>
                `Griglia Servizi: ${props.fields.heading.value || "Le Nostre Aree"}`,
              schema: fields.object({
                tagline: fields.text({
                  label: "Occhiello",
                  defaultValue: "Cosa Trovi da Noi",
                }),
                heading: fields.text({
                  label: "Titolo Sezione",
                  defaultValue: "Ludoteca, Laboratori & Giocattoleria",
                }),
                showLinkToPage: fields.checkbox({
                  label: "Mostra link 'Approfondisci e prenota'",
                  defaultValue: true,
                }),
              }),
            },
            bookingsCalendar: {
              label: "Calendario Prenotazioni a Numero Chiuso",
              itemLabel: (props) =>
                `Prenotazioni: ${props.fields.heading.value || "Laboratori & Turni"}`,
              schema: fields.object({
                tagline: fields.text({
                  label: "Occhiello",
                  defaultValue: "Prenotazione Online a Numero Chiuso",
                }),
                heading: fields.text({
                  label: "Titolo Sezione",
                  defaultValue: "Laboratori & Turni in Ludoteca",
                }),
                description: fields.text({
                  label: "Descrizione introduttiva",
                  multiline: true,
                  defaultValue:
                    "Per garantire attenzione, sicurezza e tranquillità a ogni bambino, i nostri laboratori e i turni in ludoteca sono a numero chiuso. Scegli l'appuntamento e prenota il tuo posto.",
                }),
                onlyFeatured: fields.checkbox({
                  label: "Mostra solo gli eventi in evidenza (anteprima compatta)",
                  defaultValue: false,
                }),
              }),
            },
            gallery: {
              label: "Galleria Fotografica (Gallery)",
              itemLabel: (props) =>
                `Galleria: ${props.fields.heading.value || "Foto Spazi"}`,
              schema: fields.object({
                tagline: fields.text({
                  label: "Occhiello",
                  defaultValue: "Galleria",
                }),
                heading: fields.text({
                  label: "Titolo Galleria",
                  defaultValue: "I Nostri Spazi e la Giocattoleria",
                }),
              }),
            },
            slider: {
              label: "Slider / Carosello Immagini (Slider)",
              itemLabel: (props) =>
                `Slider: ${props.fields.heading.value || "Carosello"}`,
              schema: fields.object({
                heading: fields.text({ label: "Titolo Carosello" }),
                slides: fields.array(
                  fields.object({
                    title: fields.text({ label: "Titolo Slide" }),
                    caption: fields.text({ label: "Sottotitolo / Didascalia" }),
                    image: fields.image({
                      label: "Immagine Slide",
                      directory: "public/images/gallery",
                      publicPath: "/images/gallery/",
                    }),
                  }),
                  {
                    label: "Slide del Carosello",
                    itemLabel: (props) => props.fields.title.value || "Slide",
                  }
                ),
              }),
            },
            promotion: {
              label: "Box Promozionale / Callout (Promotion)",
              itemLabel: (props) =>
                `Promotion: ${props.fields.title.value || "Callout"}`,
              schema: fields.object({
                badge: fields.text({ label: "Badge", defaultValue: "Novità" }),
                title: fields.text({ label: "Titolo Box" }),
                text: fields.text({ label: "Testo", multiline: true }),
                ctaLabel: fields.text({ label: "Testo Bottone" }),
                ctaHref: fields.text({ label: "Link Bottone" }),
              }),
            },
            video: {
              label: "Video Embed / Player (Video)",
              itemLabel: (props) =>
                `Video: ${props.fields.title.value || "Video"}`,
              schema: fields.object({
                title: fields.text({ label: "Titolo Video" }),
                videoUrl: fields.text({
                  label: "URL Video (YouTube embed o file .mp4)",
                }),
              }),
            },
            map: {
              label: "Mappa, Orari & Contatti (Map + ContactForm)",
              itemLabel: (props) =>
                `Mappa & Contatti: ${props.fields.heading.value || "Contatti"}`,
              schema: fields.object({
                tagline: fields.text({
                  label: "Occhiello",
                  defaultValue: "Dove Siamo & Orari",
                }),
                heading: fields.text({
                  label: "Titolo",
                  defaultValue: "Contatti e Orari di Apertura",
                }),
                subtitle: fields.text({
                  label: "Sottotitolo",
                  defaultValue:
                    "Passa a trovarci in giocattoleria e ludoteca oppure scrivici per qualsiasi informazione.",
                }),
              }),
            },
            separator: {
              label: "Separatore / Spazio (Separator)",
              itemLabel: () => "Separatore",
              schema: fields.object({
                line: fields.checkbox({
                  label: "Mostra linea divisoria sottile",
                  defaultValue: true,
                }),
              }),
            },
          },
          {
            label: "Page Builder (Aggiungi, riordina e personalizza i blocchi della pagina)",
          }
        ),
      },
    }),
    servizi: collection({
      label: "Aree & Servizi (Ludoteca / Giocattoleria)",
      slugField: "title",
      path: "src/content/servizi/*",
      format: { data: "json" },
      schema: {
        title: fields.slug({ name: { label: "Titolo Servizio" } }),
        badge: fields.text({ label: "Badge / Fascia Età (es. 1-10 Anni)" }),
        themeColor: fields.select({
          label: "Colore Tema Card",
          options: [
            { label: "Verde Acqua (Teal)", value: "teal" },
            { label: "Azzurro Cielo (Sky)", value: "sky" },
            { label: "Rosa Pastello (Pink)", value: "pink" },
            { label: "Pesca Delicato (Peach)", value: "peach" },
          ],
          defaultValue: "teal",
        }),
        description: fields.text({
          label: "Descrizione",
          multiline: true,
        }),
        priceInfo: fields.text({
          label: "Info Formula / Accesso",
        }),
        features: fields.array(fields.text({ label: "Caratteristica" }), {
          label: "Punti di forza",
          itemLabel: (props) => props.value || "Punto",
        }),
        order: fields.integer({
          label: "Ordine di visualizzazione",
          defaultValue: 1,
        }),
      },
    }),
    eventi: collection({
      label: "Laboratori & Turni Prenotabili",
      slugField: "title",
      path: "src/content/eventi/*",
      format: { data: "json" },
      schema: {
        title: fields.slug({ name: { label: "Titolo Laboratorio / Attività" } }),
        date: fields.text({
          label: "Data e Orario (es. Sabato 21 Novembre • 16:30 - 18:00)",
        }),
        category: fields.select({
          label: "Categoria",
          options: [
            { label: "Laboratorio Creativo", value: "Laboratorio" },
            { label: "Letture & Giochi", value: "Evento Speciale" },
            { label: "Turno Ludoteca", value: "Turno Ludoteca" },
          ],
          defaultValue: "Laboratorio",
        }),
        ageRange: fields.text({
          label: "Fascia d'età consigliata",
          defaultValue: "4 - 8 anni",
        }),
        bookable: fields.checkbox({
          label: "Abilita prenotazione online a numero chiuso",
          defaultValue: true,
        }),
        maxCapacity: fields.integer({
          label: "Numero Massimo di Posti (Capienza massima)",
          defaultValue: 10,
        }),
        price: fields.text({
          label: "Quota di partecipazione (es. 12€ materiali inclusi)",
          defaultValue: "12€ a bambino",
        }),
        summary: fields.text({
          label: "Descrizione",
          multiline: true,
        }),
        image: fields.image({
          label: "Immagine (carica dal computer)",
          directory: "public/images/gallery",
          publicPath: "/images/gallery/",
        }),
        featured: fields.checkbox({
          label: "Mostra in evidenza",
          defaultValue: true,
        }),
        order: fields.integer({
          label: "Ordine",
          defaultValue: 1,
        }),
      },
    }),
    galleria: collection({
      label: "Galleria Foto",
      slugField: "title",
      path: "src/content/galleria/*",
      format: { data: "json" },
      schema: {
        title: fields.slug({ name: { label: "Titolo Foto" } }),
        category: fields.select({
          label: "Categoria",
          options: [
            { label: "Spazi Ludoteca", value: "Spazi Ludoteca" },
            { label: "Laboratori", value: "Laboratori" },
            { label: "Giocattoleria", value: "Giocattoleria" },
          ],
          defaultValue: "Spazi Ludoteca",
        }),
        caption: fields.text({
          label: "Didascalia breve",
        }),
        image: fields.image({
          label: "Foto (carica dal computer)",
          directory: "public/images/gallery",
          publicPath: "/images/gallery/",
        }),
        order: fields.integer({
          label: "Ordine",
          defaultValue: 1,
        }),
      },
    }),
  },
});
