import { ClockIcon } from "@sanity/icons";
import { defineArrayMember, defineField, defineType } from "sanity";

const HHMM = /^([01]\d|2[0-3]):[0-5]\d$/;

/** Una fascia di apertura, es. 09:00 – 13:00. */
export const fasciaOrariaType = defineType({
  name: "fasciaOraria",
  title: "Fascia oraria",
  type: "object",
  icon: ClockIcon,
  fields: [
    defineField({
      name: "dalle",
      title: "Dalle",
      description: "Formato 24 ore, es. 09:00",
      type: "string",
      validation: (rule) =>
        rule.required().regex(HHMM, { name: "orario HH:MM" }),
    }),
    defineField({
      name: "alle",
      title: "Alle",
      description: "Formato 24 ore, es. 13:00",
      type: "string",
      validation: (rule) =>
        rule
          .required()
          .regex(HHMM, { name: "orario HH:MM" })
          .custom((alle, context) => {
            const dalle = (context.parent as { dalle?: string } | undefined)
              ?.dalle;
            if (alle && dalle && alle <= dalle) {
              return "L'orario di chiusura deve essere dopo quello di apertura.";
            }
            return true;
          }),
    }),
  ],
  options: { columns: 2 },
  preview: {
    select: { dalle: "dalle", alle: "alle" },
    prepare: ({ dalle, alle }) => ({
      title: `${dalle || "??:??"} – ${alle || "??:??"}`,
    }),
  },
});

const giorno = (name: string, title: string) =>
  defineField({
    name,
    title,
    description: "Lascia vuoto se in questo giorno siete chiusi.",
    type: "array",
    of: [defineArrayMember({ type: "fasciaOraria" })],
    validation: (rule) => rule.max(4),
  });

/**
 * Orari della settimana. Sono la fonte unica per:
 * footer, pagina contatti, badge "Aperto ora" e fasce prenotabili in ludoteca.
 */
export const orariSettimanaliType = defineType({
  name: "orariSettimanali",
  title: "Orari settimanali",
  type: "object",
  fields: [
    giorno("lunedi", "Lunedì"),
    giorno("martedi", "Martedì"),
    giorno("mercoledi", "Mercoledì"),
    giorno("giovedi", "Giovedì"),
    giorno("venerdi", "Venerdì"),
    giorno("sabato", "Sabato"),
    giorno("domenica", "Domenica"),
  ],
});
