import { DocumentIcon } from "@sanity/icons";
import { defineArrayMember, defineField, defineType } from "sanity";

/** Nomi dei blocchi disponibili nel page builder, nell'ordine del menu. */
export const BLOCCHI = [
  "banner",
  "textWithIllustration",
  "richText",
  "promotion",
  "quickActions",
  "separator",
  "bookingsCalendar",
  "ludotecaBooking",
  "partyPackages",
  "servicesList",
  "gallery",
  "slideshow",
  "slider",
  "video",
  "brands",
  "testimonials",
  "map",
  "faq",
  "whatsappCta",
] as const;

export const pageType = defineType({
  name: "page",
  title: "Pagina",
  type: "document",
  icon: DocumentIcon,
  groups: [
    { name: "contenuto", title: "Contenuto", default: true },
    { name: "seo", title: "Google e social" },
  ],
  fields: [
    defineField({
      name: "title",
      title: "Titolo",
      type: "string",
      group: "contenuto",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Indirizzo della pagina",
      description:
        'La parte finale dell\'indirizzo, es. "chi-siamo". La pagina con indirizzo "home" è la home del sito.',
      type: "slug",
      group: "contenuto",
      options: { source: "title", maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "subtitle",
      title: "Sottotitolo (opzionale)",
      description: "Se compilato compare in una fascia introduttiva in cima.",
      type: "string",
      group: "contenuto",
    }),
    defineField({
      name: "introImage",
      title: "Immagine di testata (opzionale)",
      type: "image",
      group: "contenuto",
      options: { hotspot: true },
    }),
    defineField({
      name: "pageBuilder",
      title: "Blocchi della pagina",
      description:
        "Aggiungi i blocchi e trascinali per cambiare l'ordine in cui compaiono.",
      type: "array",
      group: "contenuto",
      options: {
        insertMenu: {
          filter: true,
          groups: [
            {
              name: "contenuti",
              title: "Testi e inviti",
              of: [
                "banner",
                "textWithIllustration",
                "richText",
                "promotion",
                "quickActions",
                "separator",
              ],
            },
            {
              name: "prenotazioni",
              title: "Prenotazioni",
              of: ["bookingsCalendar", "ludotecaBooking", "partyPackages"],
            },
            {
              name: "vetrina",
              title: "Vetrina",
              of: [
                "servicesList",
                "gallery",
                "slideshow",
                "slider",
                "video",
                "brands",
                "testimonials",
              ],
            },
            {
              name: "contatti",
              title: "Contatti e domande",
              of: ["map", "faq", "whatsappCta"],
            },
          ],
          views: [{ name: "list" }],
        },
      },
      of: BLOCCHI.map((name) => defineArrayMember({ name, type: name })),
    }),
    defineField({
      name: "metaTitle",
      title: "Titolo per Google",
      description: "Se vuoto viene usato il titolo della pagina.",
      type: "string",
      group: "seo",
      validation: (rule) =>
        rule.max(70).warning("Meglio restare sotto i 70 caratteri."),
    }),
    defineField({
      name: "metaDescription",
      title: "Descrizione per Google",
      type: "text",
      rows: 3,
      group: "seo",
      validation: (rule) =>
        rule.max(170).warning("Meglio restare sotto i 170 caratteri."),
    }),
  ],
  preview: {
    select: { title: "title", slug: "slug.current", media: "introImage" },
    prepare: ({ title, slug, media }) => ({
      title: title || "Senza titolo",
      subtitle: slug === "home" ? "/ (home)" : `/${slug || ""}`,
      media,
    }),
  },
});
