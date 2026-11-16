import {
  defineLocations,
  type PresentationPluginOptions,
} from "sanity/presentation";

const paginaHref = (slug?: string) =>
  !slug || slug === "home" ? "/" : `/${slug}`;

/** Dice allo Studio in quali pagine del sito compare ogni documento. */
export const resolve: PresentationPluginOptions["resolve"] = {
  locations: {
    page: defineLocations({
      select: { title: "title", slug: "slug.current" },
      resolve: (doc) => ({
        locations: [
          { title: doc?.title || "Senza titolo", href: paginaHref(doc?.slug) },
        ],
      }),
    }),
    evento: defineLocations({
      select: { title: "title" },
      resolve: (doc) => ({
        locations: [
          { title: "Home", href: "/" },
          {
            title: doc?.title ? `Calendario: ${doc.title}` : "Calendario",
            href: "/ludoteca-e-laboratori",
          },
        ],
      }),
    }),
    impostazioni: defineLocations({
      message: "Queste impostazioni compaiono in tutte le pagine del sito.",
      tone: "caution",
      locations: [{ title: "Home", href: "/" }],
    }),
    navigation: defineLocations({
      message: "Il menu compare in tutte le pagine del sito.",
      tone: "caution",
      locations: [{ title: "Home", href: "/" }],
    }),
  },
};
