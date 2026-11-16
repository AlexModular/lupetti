import { stegaClean } from "@sanity/client/stega";
import { Image } from "next-sanity/image";

import { getImageInfo, urlFor } from "@/sanity/lib/image";
import type { SanityImageValue } from "@/types";

interface SanityImageProps {
  image?: SanityImageValue | null;
  alt: string;
  /** Larghezza massima a cui l'immagine viene mostrata, in pixel. */
  width: number;
  /** Proporzione larghezza/altezza a cui ritagliare (es. 16/10). Se assente si usa quella originale. */
  aspect?: number;
  /** Suggerimento per il browser: quanto è larga l'immagine nei vari schermi. */
  sizes?: string;
  className?: string;
  priority?: boolean;
}

/**
 * Immagine caricata da Sanity: viene servita nella dimensione giusta per ogni
 * schermo e in formato moderno (WebP/AVIF), rispettando ritaglio e punto
 * focale scelti nello Studio.
 */
export default function SanityImage({
  image,
  alt,
  width,
  aspect,
  sizes = "100vw",
  className,
  priority,
}: SanityImageProps) {
  const ref = image?.asset?._ref;
  const info = getImageInfo(ref);
  if (!image || !ref || !info) return null;

  const testoAlt = stegaClean(alt) || "";

  // Gli SVG sono vettoriali: non si ridimensionano né si ritagliano sul server.
  if (info.format === "svg") {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={urlFor(image).url()}
        alt={testoAlt}
        width={info.width}
        height={info.height}
        loading={priority ? "eager" : "lazy"}
        className={className}
      />
    );
  }

  const crop = image.crop;
  const larghezzaOriginale = info.width * (1 - (crop?.left ?? 0) - (crop?.right ?? 0));
  const altezzaOriginale = info.height * (1 - (crop?.top ?? 0) - (crop?.bottom ?? 0));
  const proporzione = aspect ?? larghezzaOriginale / altezzaOriginale;
  const height = Math.round(width / proporzione);

  const src = aspect
    ? urlFor(image).width(width).height(height).fit("crop").url()
    : urlFor(image).url();

  return (
    <Image
      src={src}
      alt={testoAlt}
      width={width}
      height={height}
      sizes={sizes}
      className={className}
      priority={priority}
    />
  );
}
