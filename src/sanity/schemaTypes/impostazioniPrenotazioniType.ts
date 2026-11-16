import { CalendarIcon } from "@sanity/icons";
import { defineArrayMember, defineField, defineType } from "sanity";

/**
 * Regole per le prenotazioni (documento unico).
 * La ludoteca si prenota a ore: ogni ora può ospitare al massimo
 * "capienzaOraria" bambini. Le fasce orarie derivano dagli orari di apertura
 * nelle Impostazioni generali.
 */
export const impostazioniPrenotazioniType = defineType({
  name: "impostazioniPrenotazioni",
  title: "Impostazioni prenotazioni",
  type: "document",
  icon: CalendarIcon,
  groups: [
    { name: "ludoteca", title: "Ludoteca a ore", default: true },
    { name: "regole", title: "Regole" },
    { name: "eccezioni", title: "Chiusure ed eccezioni" },
    { name: "dati", title: "Avvisi e dati" },
  ],
  fields: [
    defineField({
      name: "ludotecaAttiva",
      title: "Prenotazione oraria della ludoteca attiva",
      description:
        "Se disattivata, sul sito il modulo di prenotazione oraria viene sostituito da un avviso.",
      type: "boolean",
      group: "ludoteca",
      initialValue: true,
    }),
    defineField({
      name: "capienzaOraria",
      title: "Bambini per ora",
      description:
        "Quanti bambini può ospitare la ludoteca in ogni fascia di un'ora.",
      type: "number",
      group: "ludoteca",
      initialValue: 12,
      validation: (rule) => rule.required().integer().min(1).max(200),
    }),
    defineField({
      name: "prezzoInfo",
      title: "Tariffa (testo libero)",
      description: 'Es. "8€ l\'ora a bambino". Solo informativo.',
      type: "string",
      group: "ludoteca",
    }),

    defineField({
      name: "maxOrePerPrenotazione",
      title: "Massimo ore di fila per prenotazione",
      type: "number",
      group: "regole",
      initialValue: 3,
      validation: (rule) => rule.required().integer().min(1).max(12),
    }),
    defineField({
      name: "maxBambiniPerPrenotazione",
      title: "Massimo bambini per prenotazione",
      description: "Vale sia per la ludoteca sia per i laboratori.",
      type: "number",
      group: "regole",
      initialValue: 4,
      validation: (rule) => rule.required().integer().min(1).max(20),
    }),
    defineField({
      name: "anticipoMassimoGiorni",
      title: "Prenotabile fino a (giorni in anticipo)",
      type: "number",
      group: "regole",
      initialValue: 30,
      validation: (rule) => rule.required().integer().min(1).max(180),
    }),
    defineField({
      name: "preavvisoMinimoOre",
      title: "Preavviso minimo (ore)",
      description:
        "Quante ore prima dell'inizio si chiudono le prenotazioni di una fascia. 0 = fino all'ultimo minuto.",
      type: "number",
      group: "regole",
      initialValue: 2,
      validation: (rule) => rule.required().min(0).max(72),
    }),
    defineField({
      name: "confermaAutomatica",
      title: "Conferma automatica",
      description:
        'Se attiva, le prenotazioni sono subito confermate. Se disattivata arrivano "in attesa" e vanno confermate a mano dallo Studio; i posti restano comunque riservati.',
      type: "boolean",
      group: "regole",
      initialValue: true,
    }),

    defineField({
      name: "eccezioni",
      title: "Chiusure ed eccezioni",
      description:
        "Giorni in cui la ludoteca è chiusa (ferie, festivi) o ha una capienza diversa dal solito.",
      type: "array",
      group: "eccezioni",
      of: [
        defineArrayMember({
          name: "eccezione",
          title: "Eccezione",
          type: "object",
          fields: [
            defineField({
              name: "data",
              title: "Giorno",
              type: "date",
              options: { dateFormat: "DD/MM/YYYY" },
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "chiuso",
              title: "Ludoteca chiusa",
              type: "boolean",
              initialValue: true,
            }),
            defineField({
              name: "capienza",
              title: "Capienza diversa (bambini per ora)",
              description: "Compila solo se quel giorno la capienza cambia.",
              type: "number",
              hidden: ({ parent }) => Boolean(parent?.chiuso),
              validation: (rule) => rule.integer().min(0).max(200),
            }),
            defineField({
              name: "nota",
              title: "Nota (mostrata sul sito)",
              description: 'Es. "Chiusi per ferie".',
              type: "string",
            }),
          ],
          preview: {
            select: {
              data: "data",
              chiuso: "chiuso",
              capienza: "capienza",
              nota: "nota",
            },
            prepare: ({ data, chiuso, capienza, nota }) => ({
              title: data
                ? new Date(`${data}T12:00:00`).toLocaleDateString("it-IT", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })
                : "Giorno da scegliere",
              subtitle: [
                chiuso
                  ? "Chiuso"
                  : typeof capienza === "number"
                    ? `Capienza: ${capienza} bambini per ora`
                    : "Aperto",
                nota,
              ]
                .filter(Boolean)
                .join(" · "),
            }),
          },
        }),
      ],
    }),

    defineField({
      name: "emailNotifiche",
      title: "Email per gli avvisi di nuova prenotazione",
      description:
        "Se vuota viene usata l'email delle Impostazioni generali.",
      type: "string",
      group: "dati",
      validation: (rule) => rule.email(),
    }),
    defineField({
      name: "mesiConservazione",
      title: "Cancella le prenotazioni dopo (mesi)",
      description:
        "Le prenotazioni passate vengono eliminate in automatico dopo questo numero di mesi: è richiesto dalle regole sulla privacy e tiene leggero l'archivio.",
      type: "number",
      group: "dati",
      initialValue: 3,
      validation: (rule) => rule.required().integer().min(1).max(24),
    }),
  ],
  preview: {
    prepare: () => ({ title: "Impostazioni prenotazioni" }),
  },
});
