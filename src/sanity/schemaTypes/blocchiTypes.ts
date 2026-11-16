import {
  BellIcon,
  BlockContentIcon,
  BoltIcon,
  CalendarIcon,
  ClockIcon,
  CommentIcon,
  EnvelopeIcon,
  HeartIcon,
  HelpCircleIcon,
  ImageIcon,
  ImagesIcon,
  PinIcon,
  PlayIcon,
  PresentationIcon,
  RemoveIcon,
  StarIcon,
  TagIcon,
  ThLargeIcon,
} from "@sanity/icons";
import type { ComponentType } from "react";
import {
  defineArrayMember,
  defineField,
  defineType,
  type FieldDefinition,
} from "sanity";

/**
 * Blocchi del page builder. Ogni blocco è un "pezzo" di pagina che si può
 * aggiungere, togliere e spostare dallo Studio. Il componente che lo disegna
 * sul sito sta in src/components/blocks/ con lo stesso nome.
 */

export const ICONE_AZIONI = [
  { title: "Calendario prenotazioni", value: "CalendarCheck" },
  { title: "Tavolozza laboratori", value: "Palette" },
  { title: "Puzzle ludoteca", value: "Puzzle" },
  { title: "Regalo giocattoleria", value: "Gift" },
  { title: "Torta feste", value: "Cake" },
  { title: "Mappa / posizione", value: "MapPin" },
  { title: "Telefono", value: "Phone" },
];

const SFONDI = [
  { title: "Bianco", value: "white" },
  { title: "Verde acqua chiaro", value: "teal" },
  { title: "Azzurro chiaro", value: "sky" },
];

const intestazione = (predefiniti: { tagline?: string; heading?: string } = {}) => [
  defineField({
    name: "tagline",
    title: "Occhiello",
    description: "Piccola scritta sopra il titolo (opzionale).",
    type: "string",
    initialValue: predefiniti.tagline,
  }),
  defineField({
    name: "heading",
    title: "Titolo",
    type: "string",
    initialValue: predefiniti.heading,
  }),
];

const blocco = (
  name: string,
  title: string,
  icon: ComponentType,
  fields: FieldDefinition[],
  campoAnteprima = "heading"
) =>
  defineType({
    name,
    title,
    type: "object",
    icon,
    fields,
    preview: {
      select: { titolo: campoAnteprima },
      prepare: ({ titolo }) => ({
        title: typeof titolo === "string" && titolo ? titolo : title,
        subtitle: title,
      }),
    },
  });

/* ------------------------------ Testi e inviti ----------------------------- */

const bannerType = blocco("banner", "Banner di apertura", PresentationIcon, [
  defineField({
    name: "badge",
    title: "Etichetta sopra il titolo",
    type: "string",
  }),
  defineField({
    name: "heading",
    title: "Titolo principale",
    type: "string",
    validation: (rule) => rule.required(),
  }),
  defineField({
    name: "subheading",
    title: "Testo",
    type: "text",
    rows: 3,
  }),
  defineField({
    name: "showLogoCard",
    title: "Mostra il riquadro con immagine a destra",
    type: "boolean",
    initialValue: true,
  }),
  defineField({
    name: "image",
    title: "Immagine del riquadro",
    description: "Se vuota viene mostrato il logo de I Lupetti.",
    type: "image",
    options: { hotspot: true },
    hidden: ({ parent }) => parent?.showLogoCard === false,
  }),
  defineField({ name: "cta", title: "Bottone principale", type: "link" }),
  defineField({
    name: "secondaryCta",
    title: "Secondo bottone (opzionale)",
    type: "link",
  }),
]);

const textWithIllustrationType = blocco(
  "textWithIllustration",
  "Testo con immagine",
  ImageIcon,
  [
    ...intestazione(),
    defineField({ name: "text", title: "Testo", type: "blockContent" }),
    defineField({
      name: "image",
      title: "Immagine",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "imagePosition",
      title: "Posizione dell'immagine",
      type: "string",
      options: {
        layout: "radio",
        direction: "horizontal",
        list: [
          { title: "Destra", value: "right" },
          { title: "Sinistra", value: "left" },
          { title: "Sopra", value: "top" },
          { title: "Sotto", value: "bottom" },
        ],
      },
      initialValue: "right",
    }),
    defineField({
      name: "backgroundStyle",
      title: "Sfondo",
      type: "string",
      options: { list: SFONDI, layout: "radio", direction: "horizontal" },
      initialValue: "white",
    }),
    defineField({ name: "cta", title: "Bottone (opzionale)", type: "link" }),
  ]
);

const richTextType = blocco("richText", "Testo libero", BlockContentIcon, [
  defineField({ name: "heading", title: "Titolo (opzionale)", type: "string" }),
  defineField({
    name: "content",
    title: "Testo",
    type: "blockContent",
    validation: (rule) => rule.required(),
  }),
]);

const promotionType = blocco(
  "promotion",
  "Riquadro promozionale",
  BellIcon,
  [
    defineField({
      name: "badge",
      title: "Etichetta",
      type: "string",
      initialValue: "Novità",
    }),
    defineField({
      name: "title",
      title: "Titolo",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({ name: "text", title: "Testo", type: "text", rows: 3 }),
    defineField({ name: "cta", title: "Bottone", type: "link" }),
  ],
  "title"
);

const quickActionsType = defineType({
  name: "quickActions",
  title: "Azioni rapide",
  type: "object",
  icon: BoltIcon,
  fields: [
    defineField({
      name: "actions",
      title: "Azioni",
      description: "Da 2 a 4 scorciatoie con icona.",
      type: "array",
      of: [
        defineArrayMember({
          name: "quickAction",
          title: "Azione",
          type: "object",
          fields: [
            defineField({
              name: "icon",
              title: "Icona",
              type: "string",
              options: { list: ICONE_AZIONI },
              initialValue: "CalendarCheck",
            }),
            defineField({ name: "link", title: "Link", type: "link" }),
          ],
          preview: {
            select: { title: "link.label", subtitle: "icon" },
            prepare: ({ title, subtitle }) => ({
              title: title || "Azione",
              subtitle,
            }),
          },
        }),
      ],
      validation: (rule) => rule.max(4),
    }),
  ],
  preview: {
    select: { actions: "actions" },
    prepare: ({ actions }) => ({
      title: "Azioni rapide",
      subtitle: `${Array.isArray(actions) ? actions.length : 0} scorciatoie`,
    }),
  },
});

const separatorType = defineType({
  name: "separator",
  title: "Separatore",
  type: "object",
  icon: RemoveIcon,
  fields: [
    defineField({
      name: "line",
      title: "Mostra una linea sottile",
      type: "boolean",
      initialValue: true,
    }),
  ],
  preview: {
    select: { line: "line" },
    prepare: ({ line }) => ({
      title: "Separatore",
      subtitle: line ? "Con linea" : "Solo spazio",
    }),
  },
});

/* ------------------------------- Prenotazioni ------------------------------ */

const bookingsCalendarType = blocco(
  "bookingsCalendar",
  "Calendario laboratori ed eventi",
  CalendarIcon,
  [
    ...intestazione({
      tagline: "Prenotazione online a numero chiuso",
      heading: "Laboratori ed eventi in programma",
    }),
    defineField({
      name: "description",
      title: "Testo introduttivo",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "onlyFeatured",
      title: "Mostra solo gli eventi in evidenza",
      description: "Utile per un'anteprima compatta, ad esempio in home.",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "linkTutti",
      title: 'Link "Vedi tutti" (opzionale)',
      type: "link",
    }),
  ]
);

const ludotecaBookingType = blocco(
  "ludotecaBooking",
  "Prenotazione oraria ludoteca",
  ClockIcon,
  [
    ...intestazione({
      tagline: "Ludoteca su prenotazione",
      heading: "Prenota la ludoteca",
    }),
    defineField({
      name: "description",
      title: "Testo introduttivo",
      description:
        "Capienza, orari e regole si impostano in «Impostazioni prenotazioni».",
      type: "text",
      rows: 3,
    }),
  ]
);

const partyPackagesType = blocco(
  "partyPackages",
  "Pacchetti feste di compleanno",
  StarIcon,
  [
    ...intestazione({
      tagline: "Feste di compleanno",
      heading: "Festeggia da I Lupetti",
    }),
    defineField({
      name: "description",
      title: "Testo introduttivo",
      description: "I pacchetti si gestiscono nella sezione «Pacchetti feste».",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "cta",
      title: "Bottone per richiedere informazioni",
      description:
        "Se non scegli una destinazione, il bottone apre WhatsApp con un messaggio già scritto.",
      type: "link",
    }),
  ]
);

/* --------------------------------- Vetrina --------------------------------- */

const servicesListType = blocco(
  "servicesList",
  "Griglia servizi",
  HeartIcon,
  [
    ...intestazione({
      tagline: "Cosa trovi da noi",
      heading: "Ludoteca, laboratori e giocattoleria",
    }),
    defineField({
      name: "cta",
      title: "Link accanto al titolo (opzionale)",
      type: "link",
    }),
  ]
);

const galleryType = blocco("gallery", "Galleria fotografica", ImagesIcon, [
  ...intestazione({ tagline: "Galleria", heading: "I nostri spazi" }),
]);

const slideshowType = defineType({
  name: "slideshow",
  title: "Slideshow a tutta larghezza",
  type: "object",
  icon: ImagesIcon,
  fields: [
    defineField({
      name: "images",
      title: "Foto",
      description:
        "Foto grandi e orizzontali che scorrono da sole. Su ognuna si possono aggiungere titolo, sottotitolo e un bottone.",
      type: "array",
      options: { layout: "grid" },
      of: [
        defineArrayMember({
          name: "image",
          title: "Foto",
          type: "image",
          options: { hotspot: true },
          fields: [
            defineField({ name: "heading", title: "Titolo sulla foto", type: "string" }),
            defineField({ name: "subtitle", title: "Sottotitolo", type: "string" }),
            defineField({ name: "cta", title: "Bottone (opzionale)", type: "link" }),
            defineField({
              name: "alt",
              title: "Descrizione della foto",
              description: "Per chi non può vederla e per Google.",
              type: "string",
            }),
          ],
        }),
      ],
    }),
  ],
  preview: {
    select: { images: "images", media: "images.0" },
    prepare: ({ images, media }) => ({
      title: "Slideshow a tutta larghezza",
      subtitle: `${Array.isArray(images) ? images.length : 0} foto`,
      media,
    }),
  },
});

const sliderType = blocco("slider", "Carosello di immagini", ThLargeIcon, [
  defineField({ name: "heading", title: "Titolo", type: "string" }),
  defineField({
    name: "slides",
    title: "Immagini",
    type: "array",
    of: [
      defineArrayMember({
        name: "slide",
        title: "Immagine",
        type: "object",
        fields: [
          defineField({
            name: "image",
            title: "Immagine",
            type: "image",
            options: { hotspot: true },
            validation: (rule) => rule.required(),
          }),
          defineField({ name: "title", title: "Titolo", type: "string" }),
          defineField({ name: "caption", title: "Didascalia", type: "string" }),
        ],
        preview: {
          select: { title: "title", subtitle: "caption", media: "image" },
        },
      }),
    ],
  }),
]);

const videoType = blocco(
  "video",
  "Video",
  PlayIcon,
  [
    defineField({ name: "title", title: "Titolo", type: "string" }),
    defineField({
      name: "videoUrl",
      title: "Indirizzo del video",
      description:
        "Link di YouTube (anche quello normale della pagina del video) oppure un file .mp4.",
      type: "url",
      validation: (rule) => rule.required(),
    }),
  ],
  "title"
);

const brandsType = blocco("brands", "Marchi della giocattoleria", TagIcon, [
  defineField({
    name: "heading",
    title: "Titolo",
    type: "string",
    initialValue: "I marchi che trovi in negozio",
  }),
  defineField({
    name: "brands",
    title: "Marchi",
    type: "array",
    of: [
      defineArrayMember({
        name: "brand",
        title: "Marchio",
        type: "object",
        fields: [
          defineField({
            name: "nome",
            title: "Nome",
            type: "string",
            validation: (rule) => rule.required(),
          }),
          defineField({
            name: "logo",
            title: "Logo (opzionale)",
            description: "Senza logo viene mostrato il nome.",
            type: "image",
          }),
        ],
        preview: { select: { title: "nome", media: "logo" } },
      }),
    ],
  }),
]);

const testimonialsType = blocco(
  "testimonials",
  "Recensioni dei genitori",
  CommentIcon,
  [
    ...intestazione({
      tagline: "Dicono di noi",
      heading: "Le parole dei genitori",
    }),
    defineField({
      name: "items",
      title: "Recensioni",
      type: "array",
      of: [
        defineArrayMember({
          name: "recensione",
          title: "Recensione",
          type: "object",
          fields: [
            defineField({
              name: "testo",
              title: "Testo",
              type: "text",
              rows: 3,
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "autore",
              title: "Nome",
              type: "string",
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "dettaglio",
              title: "Dettaglio",
              description: 'Es. "mamma di Leo, 4 anni"',
              type: "string",
            }),
            defineField({
              name: "stelle",
              title: "Stelle",
              type: "number",
              options: { list: [5, 4, 3] },
              initialValue: 5,
            }),
          ],
          preview: { select: { title: "autore", subtitle: "testo" } },
        }),
      ],
    }),
  ]
);

/* ---------------------------- Contatti e domande --------------------------- */

const mapType = blocco("map", "Mappa, orari e contatti", PinIcon, [
  ...intestazione({
    tagline: "Dove siamo e orari",
    heading: "Contatti e orari di apertura",
  }),
  defineField({ name: "subtitle", title: "Sottotitolo", type: "string" }),
  defineField({
    name: "showForm",
    title: "Mostra il modulo per scrivere un messaggio",
    type: "boolean",
    initialValue: true,
  }),
]);

const faqType = blocco("faq", "Domande frequenti", HelpCircleIcon, [
  ...intestazione({ tagline: "Domande frequenti", heading: "Buono a sapersi" }),
  defineField({
    name: "items",
    title: "Domande",
    type: "array",
    of: [
      defineArrayMember({
        name: "domandaRisposta",
        title: "Domanda",
        type: "object",
        fields: [
          defineField({
            name: "domanda",
            title: "Domanda",
            type: "string",
            validation: (rule) => rule.required(),
          }),
          defineField({
            name: "risposta",
            title: "Risposta",
            type: "text",
            rows: 3,
            validation: (rule) => rule.required(),
          }),
        ],
        preview: { select: { title: "domanda", subtitle: "risposta" } },
      }),
    ],
  }),
]);

const whatsappCtaType = blocco(
  "whatsappCta",
  "Invito a scrivere su WhatsApp",
  EnvelopeIcon,
  [
    defineField({
      name: "heading",
      title: "Titolo",
      type: "string",
      initialValue: "Hai una domanda? Scrivici su WhatsApp",
    }),
    defineField({ name: "text", title: "Testo", type: "text", rows: 2 }),
    defineField({
      name: "label",
      title: "Testo del bottone",
      type: "string",
      initialValue: "Scrivici su WhatsApp",
    }),
    defineField({
      name: "messaggio",
      title: "Messaggio già scritto",
      description: "Il genitore lo trova pronto in WhatsApp e può modificarlo.",
      type: "string",
      initialValue: "Ciao I Lupetti! Vi scrivo dal sito per un'informazione.",
    }),
  ]
);

export const blocchiTypes = [
  bannerType,
  textWithIllustrationType,
  richTextType,
  promotionType,
  quickActionsType,
  separatorType,
  bookingsCalendarType,
  ludotecaBookingType,
  partyPackagesType,
  servicesListType,
  galleryType,
  slideshowType,
  sliderType,
  videoType,
  brandsType,
  testimonialsType,
  mapType,
  faqType,
  whatsappCtaType,
];
