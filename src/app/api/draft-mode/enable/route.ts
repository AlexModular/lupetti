import { defineEnableDraftMode } from "next-sanity/draft-mode";

import { client } from "@/sanity/lib/client";
import { token } from "@/sanity/lib/token";

/**
 * Attiva l'anteprima delle bozze. La chiama lo strumento "Anteprima" dello
 * Studio con un segreto monouso che viene verificato qui con il token.
 */
export const { GET } = defineEnableDraftMode({
  client: client.withConfig({ token }),
});
