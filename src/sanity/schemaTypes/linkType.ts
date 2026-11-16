import { LinkIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

/**
 * Link riutilizzabile (bottoni, voci di menu, azioni rapide).
 * Si sceglie una pagina del sito oppure si incolla un indirizzo esterno.
 */
export const linkType = defineType({
  name: "link",
  title: "Link",
  type: "object",
  icon: LinkIcon,
  fields: [
    defineField({
      name: "label",
      title: "Testo",
      type: "string",
    }),
    defineField({
      name: "pagina",
      title: "Pagina del sito",
      type: "reference",
      to: [{ type: "page" }],
    }),
    defineField({
      name: "ancora",
      title: "Sezione della pagina (opzionale)",
      description:
        'Per saltare a una sezione precisa. Valori disponibili: "prenotazioni" (calendario laboratori), "ludoteca" (prenotazione oraria), "feste", "faq", "contatti".',
      type: "string",
      validation: (rule) =>
        rule.regex(/^[a-z0-9-]+$/, {
          name: "ancora",
          invert: false,
        }).warning("Usa solo lettere minuscole, numeri e trattini."),
    }),
    defineField({
      name: "urlEsterno",
      title: "Oppure: indirizzo esterno",
      description:
        "Se compilato ha la precedenza sulla pagina. Es. https://instagram.com/…",
      type: "url",
      validation: (rule) =>
        rule.uri({ scheme: ["http", "https", "mailto", "tel"] }),
    }),
  ],
  preview: {
    select: {
      label: "label",
      pagina: "pagina.title",
      ancora: "ancora",
      urlEsterno: "urlEsterno",
    },
    prepare({ label, pagina, ancora, urlEsterno }) {
      const destinazione =
        urlEsterno || [pagina, ancora ? `#${ancora}` : null].filter(Boolean).join(" ");
      return {
        title: label || "Link senza testo",
        subtitle: destinazione || "Nessuna destinazione",
      };
    },
  },
});
