import { createClient } from "next-sanity";

import { apiVersion, dataset, projectId, studioUrl } from "../env";

/**
 * Client pubblico: legge solo i contenuti pubblicati del sito.
 * Non ha token, quindi non può vedere le prenotazioni (documenti con ID "privato").
 */
export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
  stega: { studioUrl },
});
