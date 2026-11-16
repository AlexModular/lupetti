import { CogIcon } from "@sanity/icons";
import { defineArrayMember, defineField, defineType } from "sanity";

/** Icone disponibili per le schede "Informazioni utili". */
export const ICONE_INFO = [
  { title: "Bimbo / prima infanzia", value: "Baby" },
  { title: "Parcheggio", value: "Car" },
  { title: "Pagamenti", value: "CreditCard" },
  { title: "Accessibilità", value: "Accessibility" },
  { title: "Cuore", value: "Heart" },
  { title: "Informazione", value: "Info" },
];

/** Impostazioni generali del sito (documento unico). */
export const impostazioniType = defineType({
  name: "impostazioni",
  title: "Impostazioni generali",
  type: "document",
  icon: CogIcon,
  groups: [
    { name: "attivita", title: "Attività", default: true },
    { name: "contatti", title: "Contatti e indirizzo" },
    { name: "orari", title: "Orari" },
    { name: "seo", title: "Google e social" },
  ],
  fields: [
    defineField({
      name: "nomeAttivita",
      title: "Nome dell'attività",
      type: "string",
      group: "attivita",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "descrizioneBreve",
      title: "Descrizione breve",
      description: "Compare nel piè di pagina, sotto il logo.",
      type: "text",
      rows: 3,
      group: "attivita",
    }),
    defineField({
      name: "infoUtili",
      title: "Informazioni utili",
      description:
        "Schede brevi mostrate nella pagina contatti (parcheggio, fasciatoio, pagamenti…).",
      type: "array",
      group: "attivita",
      of: [
        defineArrayMember({
          name: "infoUtile",
          title: "Informazione",
          type: "object",
          fields: [
            defineField({
              name: "icona",
              title: "Icona",
              type: "string",
              options: { list: ICONE_INFO },
              initialValue: "Info",
            }),
            defineField({
              name: "titolo",
              title: "Titolo",
              type: "string",
              validation: (rule) => rule.required(),
            }),
            defineField({ name: "testo", title: "Testo", type: "text", rows: 2 }),
          ],
          preview: { select: { title: "titolo", subtitle: "testo" } },
        }),
      ],
      validation: (rule) => rule.max(6),
    }),

    defineField({
      name: "telefono",
      title: "Telefono",
      type: "string",
      group: "contatti",
    }),
    defineField({
      name: "whatsapp",
      title: "Numero WhatsApp",
      description:
        "Solo cifre, con prefisso internazionale e senza + né spazi. Es. 393481234567",
      type: "string",
      group: "contatti",
      validation: (rule) =>
        rule.regex(/^\d{8,15}$/, { name: "solo cifre" }),
    }),
    defineField({
      name: "email",
      title: "Email",
      type: "string",
      group: "contatti",
      validation: (rule) => rule.email(),
    }),
    defineField({
      name: "via",
      title: "Via e numero civico",
      type: "string",
      group: "contatti",
    }),
    defineField({
      name: "cap",
      title: "CAP",
      type: "string",
      group: "contatti",
    }),
    defineField({
      name: "citta",
      title: "Città",
      type: "string",
      group: "contatti",
    }),
    defineField({
      name: "provincia",
      title: "Provincia (sigla)",
      type: "string",
      group: "contatti",
      validation: (rule) => rule.max(2),
    }),
    defineField({
      name: "indicazioni",
      title: "Come raggiungerci / parcheggio",
      type: "text",
      rows: 2,
      group: "contatti",
    }),
    defineField({
      name: "instagramUrl",
      title: "Instagram",
      type: "url",
      group: "contatti",
    }),
    defineField({
      name: "facebookUrl",
      title: "Facebook",
      type: "url",
      group: "contatti",
    }),

    defineField({
      name: "orari",
      title: "Orari di apertura",
      description:
        "Valgono per tutto il sito: piè di pagina, contatti, badge \"Aperto ora\" e fasce prenotabili della ludoteca.",
      type: "orariSettimanali",
      group: "orari",
    }),
    defineField({
      name: "notaOrari",
      title: "Nota sugli orari (opzionale)",
      description: 'Es. "Ad agosto chiusi il sabato pomeriggio".',
      type: "string",
      group: "orari",
    }),

    defineField({
      name: "metaTitle",
      title: "Titolo predefinito per Google",
      type: "string",
      group: "seo",
    }),
    defineField({
      name: "metaDescription",
      title: "Descrizione predefinita per Google",
      type: "text",
      rows: 3,
      group: "seo",
    }),
    defineField({
      name: "ogImage",
      title: "Immagine per le anteprime social",
      description:
        "Compare quando qualcuno condivide il sito su WhatsApp o Facebook. Ideale 1200×630.",
      type: "image",
      group: "seo",
    }),
    defineField({
      name: "paginaPrivacy",
      title: "Pagina dell'informativa privacy",
      description:
        "Viene collegata nella casella di consenso dei moduli di prenotazione.",
      type: "reference",
      to: [{ type: "page" }],
      group: "seo",
    }),
  ],
  preview: {
    prepare: () => ({ title: "Impostazioni generali" }),
  },
});
