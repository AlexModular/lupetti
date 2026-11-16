import {
  CheckmarkCircleIcon,
  ClockIcon,
  CloseCircleIcon,
} from "@sanity/icons";
import { defineField, defineType } from "sanity";

export const STATI_PRENOTAZIONE = [
  { title: "Confermata", value: "confermata" },
  { title: "In attesa di conferma", value: "in_attesa" },
  { title: "Annullata (libera i posti)", value: "annullata" },
];

const formattaGiorno = (data?: string) =>
  data
    ? new Date(`${data}T12:00:00`).toLocaleDateString("it-IT", {
        weekday: "short",
        day: "numeric",
        month: "short",
      })
    : "";

/**
 * Prenotazione ricevuta dal sito.
 *
 * IMPORTANTE: questi documenti contengono dati personali. Vengono creati solo
 * dal server con un ID che contiene un punto ("prenotazione.xxxx"): in Sanity
 * i documenti con il punto nell'ID sono leggibili solo con un token, anche se
 * il dataset è pubblico. Per questo dallo Studio non si possono creare né
 * duplicare (avrebbero un ID pubblico): vedi sanity.config.ts.
 *
 * "liveEdit" salva subito le modifiche, senza bozze: così non esistono mai
 * due copie della stessa prenotazione e i posti liberi sono sempre corretti.
 */
export const prenotazioneType = defineType({
  name: "prenotazione",
  title: "Prenotazione",
  type: "document",
  liveEdit: true,
  icon: CheckmarkCircleIcon,
  groups: [
    { name: "prenotazione", title: "Prenotazione", default: true },
    { name: "famiglia", title: "Famiglia" },
  ],
  fields: [
    defineField({
      name: "stato",
      title: "Stato",
      description:
        'Scegli "Annullata" per liberare i posti: la modifica vale subito.',
      type: "string",
      group: "prenotazione",
      options: { list: STATI_PRENOTAZIONE, layout: "radio" },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "codice",
      title: "Codice prenotazione",
      type: "string",
      group: "prenotazione",
      readOnly: true,
    }),
    defineField({
      name: "tipo",
      title: "Tipo",
      type: "string",
      group: "prenotazione",
      readOnly: true,
      options: {
        list: [
          { title: "Ludoteca a ore", value: "ludoteca" },
          { title: "Laboratorio / evento", value: "evento" },
        ],
      },
    }),
    defineField({
      name: "data",
      title: "Giorno",
      type: "date",
      group: "prenotazione",
      readOnly: true,
      options: { dateFormat: "DD/MM/YYYY" },
    }),
    defineField({
      name: "oraInizio",
      title: "Dalle",
      type: "string",
      group: "prenotazione",
      readOnly: true,
    }),
    defineField({
      name: "oraFine",
      title: "Alle",
      type: "string",
      group: "prenotazione",
      readOnly: true,
    }),
    defineField({
      name: "slots",
      title: "Fasce orarie occupate",
      type: "array",
      of: [{ type: "string" }],
      group: "prenotazione",
      readOnly: true,
      hidden: ({ document }) => document?.tipo !== "ludoteca",
    }),
    defineField({
      name: "evento",
      title: "Laboratorio / evento",
      type: "reference",
      to: [{ type: "evento" }],
      weak: true,
      group: "prenotazione",
      readOnly: true,
      hidden: ({ document }) => document?.tipo !== "evento",
    }),
    defineField({
      name: "eventoTitolo",
      title: "Titolo dell'evento al momento della prenotazione",
      type: "string",
      group: "prenotazione",
      readOnly: true,
      hidden: ({ document }) => document?.tipo !== "evento",
    }),
    defineField({
      name: "bambini",
      title: "Numero di bambini",
      description:
        "Attenzione: se aumenti il numero da qui il sito non controlla la capienza.",
      type: "number",
      group: "prenotazione",
      validation: (rule) => rule.required().integer().min(1),
    }),
    defineField({
      name: "noteInterne",
      title: "Note interne",
      description: "Visibili solo a voi, mai al genitore.",
      type: "text",
      rows: 2,
      group: "prenotazione",
    }),

    defineField({
      name: "genitoreNome",
      title: "Genitore",
      type: "string",
      group: "famiglia",
    }),
    defineField({
      name: "telefono",
      title: "Telefono",
      type: "string",
      group: "famiglia",
    }),
    defineField({
      name: "email",
      title: "Email",
      type: "string",
      group: "famiglia",
    }),
    defineField({
      name: "bambinoNome",
      title: "Nome dei bambini",
      type: "string",
      group: "famiglia",
    }),
    defineField({
      name: "bambinoEta",
      title: "Età",
      type: "string",
      group: "famiglia",
    }),
    defineField({
      name: "note",
      title: "Note del genitore",
      type: "text",
      rows: 2,
      group: "famiglia",
    }),
    defineField({
      name: "consensoPrivacy",
      title: "Consenso privacy dato",
      type: "boolean",
      group: "famiglia",
      readOnly: true,
    }),
    defineField({
      name: "annullataIl",
      title: "Annullata dal genitore il",
      type: "datetime",
      group: "famiglia",
      readOnly: true,
      hidden: ({ value }) => !value,
    }),
    defineField({
      name: "creataIl",
      title: "Ricevuta il",
      type: "datetime",
      group: "famiglia",
      readOnly: true,
    }),
  ],
  orderings: [
    {
      title: "Giorno e ora (prossime prima)",
      name: "dataAsc",
      by: [
        { field: "data", direction: "asc" },
        { field: "oraInizio", direction: "asc" },
      ],
    },
    {
      title: "Giorno e ora (recenti prima)",
      name: "dataDesc",
      by: [
        { field: "data", direction: "desc" },
        { field: "oraInizio", direction: "desc" },
      ],
    },
    {
      title: "Ricevute di recente",
      name: "creataDesc",
      by: [{ field: "creataIl", direction: "desc" }],
    },
  ],
  preview: {
    select: {
      stato: "stato",
      tipo: "tipo",
      data: "data",
      oraInizio: "oraInizio",
      oraFine: "oraFine",
      bambini: "bambini",
      bambinoNome: "bambinoNome",
      genitoreNome: "genitoreNome",
      eventoTitolo: "eventoTitolo",
      codice: "codice",
    },
    prepare({
      stato,
      tipo,
      data,
      oraInizio,
      oraFine,
      bambini,
      bambinoNome,
      genitoreNome,
      eventoTitolo,
      codice,
    }) {
      const quando = [
        formattaGiorno(data),
        oraInizio ? `${oraInizio}${oraFine ? `–${oraFine}` : ""}` : null,
      ]
        .filter(Boolean)
        .join(" ");
      const cosa = tipo === "evento" ? eventoTitolo || "Evento" : "Ludoteca";
      const quanti = `${bambini ?? "?"} ${bambini === 1 ? "bambino" : "bambini"}`;
      const prefisso =
        stato === "annullata"
          ? "ANNULLATA · "
          : stato === "in_attesa"
            ? "IN ATTESA · "
            : "";
      return {
        title: `${prefisso}${quando} · ${bambinoNome || "?"} (${quanti})`,
        subtitle: [cosa, genitoreNome, codice].filter(Boolean).join(" · "),
        media:
          stato === "annullata"
            ? CloseCircleIcon
            : stato === "in_attesa"
              ? ClockIcon
              : CheckmarkCircleIcon,
      };
    },
  },
});
