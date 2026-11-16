import { HeartIcon, ImageIcon, StarIcon } from "@sanity/icons";
import { defineArrayMember, defineField, defineType } from "sanity";

export const COLORI_TEMA = [
  { title: "Verde acqua", value: "teal" },
  { title: "Azzurro cielo", value: "sky" },
  { title: "Rosa pastello", value: "pink" },
  { title: "Pesca", value: "peach" },
];

export const CATEGORIE_FOTO = [
  { title: "Spazi ludoteca", value: "Spazi Ludoteca" },
  { title: "Laboratori", value: "Laboratori" },
  { title: "Giocattoleria", value: "Giocattoleria" },
  { title: "Feste", value: "Feste" },
];

const ordine = defineField({
  name: "order",
  title: "Ordine di visualizzazione",
  description: "I numeri più bassi compaiono per primi.",
  type: "number",
  initialValue: 10,
});

/** Area o servizio mostrato nella griglia "Servizi". */
export const servizioType = defineType({
  name: "servizio",
  title: "Servizio",
  type: "document",
  icon: HeartIcon,
  fields: [
    defineField({
      name: "title",
      title: "Titolo",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "badge",
      title: "Etichetta",
      description: 'Es. "1 – 10 anni" oppure "Su prenotazione"',
      type: "string",
    }),
    defineField({
      name: "themeColor",
      title: "Colore della scheda",
      type: "string",
      options: { list: COLORI_TEMA, layout: "radio", direction: "horizontal" },
      initialValue: "teal",
    }),
    defineField({
      name: "description",
      title: "Descrizione",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "features",
      title: "Punti di forza",
      type: "array",
      of: [defineArrayMember({ type: "string" })],
    }),
    defineField({
      name: "priceInfo",
      title: "Riga in fondo alla scheda",
      description: 'Es. "Accesso a turni e baby parking"',
      type: "string",
    }),
    ordine,
  ],
  orderings: [
    {
      title: "Ordine di visualizzazione",
      name: "orderAsc",
      by: [{ field: "order", direction: "asc" }],
    },
  ],
  preview: { select: { title: "title", subtitle: "badge" } },
});

/** Foto della galleria. */
export const fotoType = defineType({
  name: "foto",
  title: "Foto",
  type: "document",
  icon: ImageIcon,
  fields: [
    defineField({
      name: "title",
      title: "Titolo",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "immagine",
      title: "Foto",
      type: "image",
      options: { hotspot: true },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "categoria",
      title: "Categoria",
      type: "string",
      options: { list: CATEGORIE_FOTO },
      initialValue: "Spazi Ludoteca",
    }),
    defineField({
      name: "didascalia",
      title: "Didascalia",
      type: "string",
    }),
    ordine,
  ],
  orderings: [
    {
      title: "Ordine di visualizzazione",
      name: "orderAsc",
      by: [{ field: "order", direction: "asc" }],
    },
  ],
  preview: {
    select: { title: "title", subtitle: "categoria", media: "immagine" },
  },
});

/** Pacchetto per le feste di compleanno. */
export const pacchettoFestaType = defineType({
  name: "pacchettoFesta",
  title: "Pacchetto festa",
  type: "document",
  icon: StarIcon,
  fields: [
    defineField({
      name: "nome",
      title: "Nome del pacchetto",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "prezzo",
      title: "Prezzo",
      description: 'Es. "da 180€"',
      type: "string",
    }),
    defineField({
      name: "dettagli",
      title: "Durata e numero di bambini",
      description: 'Es. "2 ore · fino a 12 bambini"',
      type: "string",
    }),
    defineField({
      name: "descrizione",
      title: "Descrizione",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "incluso",
      title: "Cosa è incluso",
      type: "array",
      of: [defineArrayMember({ type: "string" })],
    }),
    defineField({
      name: "inEvidenza",
      title: 'Metti in evidenza ("Il più scelto")',
      type: "boolean",
      initialValue: false,
    }),
    ordine,
  ],
  orderings: [
    {
      title: "Ordine di visualizzazione",
      name: "orderAsc",
      by: [{ field: "order", direction: "asc" }],
    },
  ],
  preview: { select: { title: "nome", subtitle: "prezzo" } },
});
