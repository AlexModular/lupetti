import "server-only";

import { client } from "./client";
import { token } from "./token";

/**
 * Client con token, solo lato server. Legge e scrive le prenotazioni.
 * - niente CDN: i posti disponibili devono essere sempre aggiornati
 * - perspective "published": ignora le bozze create nello Studio
 */
export const serverClient = client.withConfig({
  token,
  useCdn: false,
  perspective: "published",
  stega: false,
});
