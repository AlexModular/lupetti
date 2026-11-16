import { MenuIcon } from "@sanity/icons";
import { defineArrayMember, defineField, defineType } from "sanity";

/** Menu principale del sito (documento unico). */
export const navigationType = defineType({
  name: "navigation",
  title: "Menu di navigazione",
  type: "document",
  icon: MenuIcon,
  fields: [
    defineField({
      name: "items",
      title: "Voci del menu",
      description: "Trascina le voci per cambiarne l'ordine.",
      type: "array",
      of: [defineArrayMember({ type: "link" })],
    }),
    defineField({
      name: "cta",
      title: "Bottone in evidenza (a destra)",
      type: "link",
    }),
  ],
  preview: {
    prepare: () => ({ title: "Menu di navigazione" }),
  },
});
