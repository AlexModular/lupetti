// "sanityFetch" tiene i contenuti aggiornati in automatico: quando si pubblica
// una modifica nello Studio il sito si aggiorna senza dover rifare il deploy.
import { defineLive } from "next-sanity";

import { client } from "./client";
import { token } from "./token";

export const { sanityFetch, SanityLive } = defineLive({
  client,
  // Usato solo sul server, per leggere le bozze in modalità anteprima.
  serverToken: token,
  // Il token può scrivere e leggere le prenotazioni: non va mai dato al browser.
  browserToken: false,
  // Gli aggiornamenti dal vivo arrivano solo se qualcuno ha il sito aperto nel
  // momento in cui si pubblica. Come rete di sicurezza i contenuti vengono
  // riletti al massimo ogni minuto: una modifica compare comunque entro un
  // minuto e i laboratori già passati spariscono da soli.
  fetchOptions: { revalidate: 60 },
});
