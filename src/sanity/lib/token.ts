import "server-only";

/**
 * Token con permessi di scrittura: serve per salvare le prenotazioni e per
 * leggere le bozze in anteprima. Non deve MAI arrivare al browser: per questo
 * il file importa "server-only" e il token non viene passato a nessun
 * componente client.
 */
export const token = process.env.SANITY_API_WRITE_TOKEN;

if (!token) {
  throw new Error("Missing environment variable: SANITY_API_WRITE_TOKEN");
}
