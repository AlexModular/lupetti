import { cache } from "react";

import type { Impostazioni, Navigation, Pagina, RegolePrenotazioni } from "@/types";

import { sanityFetch } from "./live";
import { PAGE_QUERY, REGOLE_QUERY, SITE_QUERY } from "./queries";

/**
 * Impostazioni e menu. "stega: false" perché orari, numeri di telefono e link
 * vengono usati nei calcoli: i caratteri invisibili che servono per il
 * "clicca e modifica" dell'anteprima li romperebbero.
 * `cache` evita di ripetere la stessa richiesta dentro un singolo rendering.
 */
export const getSito = cache(async () => {
  const { data } = await sanityFetch({ query: SITE_QUERY, stega: false });
  return data as {
    impostazioni: Impostazioni | null;
    navigation: Navigation | null;
  };
});

export const getPagina = cache(async (slug: string) => {
  const { data } = await sanityFetch({ query: PAGE_QUERY, params: { slug } });
  return data as Pagina | null;
});

export const getRegolePrenotazioni = cache(async () => {
  const { data } = await sanityFetch({ query: REGOLE_QUERY, stega: false });
  return data as RegolePrenotazioni | null;
});
