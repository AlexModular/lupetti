import { CalendarIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

export const CATEGORIE_EVENTO = [
  { title: "Laboratorio creativo", value: "Laboratorio" },
  { title: "Letture e giochi", value: "Evento speciale" },
  { title: "Turno speciale in ludoteca", value: "Turno ludoteca" },
];

const formattaQuando = (inizio?: string, fine?: string) => {
  if (!inizio) return "Data da definire";
  const opzioni = { timeZone: "Europe/Rome" } as const;
  const giorno = new Date(inizio).toLocaleDateString("it-IT", {
    ...opzioni,
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const ora = (iso: string) =>
    new Date(iso).toLocaleTimeString("it-IT", {
      ...opzioni,
      hour: "2-digit",
      minute: "2-digit",
    });
  return `${giorno} · ${ora(inizio)}${fine ? ` – ${ora(fine)}` : ""}`;
};

/** Laboratorio o evento a data fissa, prenotabile a numero chiuso. */
export const eventoType = defineType({
  name: "evento",
  title: "Laboratorio / evento",
  type: "document",
  icon: CalendarIcon,
  groups: [
    { name: "evento", title: "Evento", default: true },
    { name: "prenotazioni", title: "Prenotazioni" },
  ],
  fields: [
    defineField({
      name: "title",
      title: "Titolo",
      type: "string",
      group: "evento",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "categoria",
      title: "Categoria",
      type: "string",
      group: "evento",
      options: { list: CATEGORIE_EVENTO },
      initialValue: "Laboratorio",
    }),
    defineField({
      name: "inizio",
      title: "Inizio",
      type: "datetime",
      group: "evento",
      options: { dateFormat: "DD/MM/YYYY", timeFormat: "HH:mm", timeStep: 15 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "fine",
      title: "Fine",
      description:
        "Passato questo orario l'evento sparisce dal sito in automatico.",
      type: "datetime",
      group: "evento",
      options: { dateFormat: "DD/MM/YYYY", timeFormat: "HH:mm", timeStep: 15 },
      validation: (rule) =>
        rule.required().min(rule.valueOfField("inizio")),
    }),
    defineField({
      name: "fasciaEta",
      title: "Fascia d'età consigliata",
      description: 'Es. "4 – 8 anni"',
      type: "string",
      group: "evento",
    }),
    defineField({
      name: "prezzo",
      title: "Quota di partecipazione",
      description: 'Es. "12€ (materiali inclusi)"',
      type: "string",
      group: "evento",
    }),
    defineField({
      name: "descrizione",
      title: "Descrizione",
      type: "text",
      rows: 4,
      group: "evento",
    }),
    defineField({
      name: "immagine",
      title: "Immagine",
      type: "image",
      group: "evento",
      options: { hotspot: true },
    }),
    defineField({
      name: "inEvidenza",
      title: "In evidenza",
      description: "Gli eventi in evidenza compaiono anche in home.",
      type: "boolean",
      group: "evento",
      initialValue: true,
    }),

    defineField({
      name: "prenotabile",
      title: "Prenotabile online",
      type: "boolean",
      group: "prenotazioni",
      initialValue: true,
    }),
    defineField({
      name: "capienza",
      title: "Posti disponibili",
      description: "Numero massimo di bambini.",
      type: "number",
      group: "prenotazioni",
      initialValue: 10,
      hidden: ({ parent }) => parent?.prenotabile === false,
      validation: (rule) => rule.integer().min(1).max(500),
    }),
    defineField({
      name: "ludotecaDuranteEvento",
      title: "Ludoteca durante l'evento",
      description:
        "Cosa succede alle fasce orarie della ludoteca mentre si svolge questo evento.",
      type: "string",
      group: "prenotazioni",
      options: {
        layout: "radio",
        list: [
          { title: "Chiusa: l'evento occupa la sala", value: "chiusa" },
          { title: "Aperta con capienza ridotta", value: "ridotta" },
          { title: "Resta aperta (spazi separati)", value: "aperta" },
        ],
      },
      initialValue: "chiusa",
    }),
    defineField({
      name: "riduzioneCapienza",
      title: "Posti in meno in ludoteca",
      description:
        "Quanti bambini in meno può ospitare la ludoteca in ogni ora che si sovrappone all'evento.",
      type: "number",
      group: "prenotazioni",
      hidden: ({ parent }) => parent?.ludotecaDuranteEvento !== "ridotta",
      validation: (rule) => rule.integer().min(1).max(200),
    }),
  ],
  orderings: [
    {
      title: "Data (prossimi prima)",
      name: "inizioAsc",
      by: [{ field: "inizio", direction: "asc" }],
    },
    {
      title: "Data (recenti prima)",
      name: "inizioDesc",
      by: [{ field: "inizio", direction: "desc" }],
    },
  ],
  preview: {
    select: {
      title: "title",
      inizio: "inizio",
      fine: "fine",
      media: "immagine",
    },
    prepare: ({ title, inizio, fine, media }) => ({
      title: title || "Senza titolo",
      subtitle: formattaQuando(inizio, fine),
      media,
    }),
  },
});
