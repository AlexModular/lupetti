import createImageUrlBuilder from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";

import { dataset, projectId } from "../env";

const builder = createImageUrlBuilder({ projectId, dataset });

export const urlFor = (source: SanityImageSource) => builder.image(source);

const ASSET_ID = /^image-[a-zA-Z0-9]+-(\d+)x(\d+)-(\w+)$/;

/** Ricava larghezza, altezza e formato dall'ID dell'immagine Sanity. */
export function getImageInfo(ref: string | undefined | null) {
  const match = ref ? ASSET_ID.exec(ref) : null;
  if (!match) return null;
  return {
    width: parseInt(match[1], 10),
    height: parseInt(match[2], 10),
    format: match[3],
  };
}
