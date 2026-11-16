import { stegaClean } from "@sanity/client/stega";
import { ArrowRight } from "lucide-react";

import RichText from "@/components/RichText";
import SanityImage from "@/components/SanityImage";
import SmartLink from "@/components/SmartLink";
import type { TextWithIllustrationBlock } from "@/types";

const SFONDI: Record<string, string> = {
  white: "bg-white",
  teal: "bg-gradient-to-b from-lupetti-tealLight/40 to-white",
  sky: "bg-gradient-to-b from-lupetti-skyLight/40 to-white",
};

export default function TextWithIllustration({
  item,
}: {
  item: TextWithIllustrationBlock;
}) {
  const posizione = stegaClean(item.imagePosition) || "right";
  const sfondo = SFONDI[stegaClean(item.backgroundStyle) || "white"] ?? SFONDI.white;
  const verticale = posizione === "top" || posizione === "bottom";
  const haImmagine = Boolean(item.image?.asset?._ref);

  const immagine = haImmagine ? (
    <div className="flex justify-center">
      <div className="max-w-md w-full" data-reveal>
        <SanityImage
          image={item.image}
          alt={item.heading || ""}
          width={800}
          sizes="(min-width: 1024px) 400px, 90vw"
          className="w-full h-auto object-contain"
        />
      </div>
    </div>
  ) : null;

  const testo = (
    <div>
      {item.tagline && (
        <span className="occhiello">
          {item.tagline}
        </span>
      )}
      {item.heading && (
        <h2 className="font-display font-semibold uppercase tracking-wide text-3xl sm:text-4xl text-lupetti-tealDark mt-1 text-balance">
          {item.heading}
        </h2>
      )}
      <RichText value={item.text} className="mt-5" />
      {item.cta?.label && (
        <div className="mt-6">
          <SmartLink
            href={item.cta.href}
            className="btn-pieno"
          >
            <span>{item.cta.label}</span>
            <ArrowRight className="w-4 h-4" aria-hidden />
          </SmartLink>
        </div>
      )}
    </div>
  );

  return (
    <section className={`py-14 sm:py-20 ${sfondo}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {verticale || !haImmagine ? (
          <div className="max-w-3xl mx-auto text-center space-y-8">
            {posizione === "top" && immagine}
            {testo}
            {posizione === "bottom" && immagine}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div
              className={`lg:col-span-7 ${
                posizione === "left" ? "lg:order-2" : ""
              }`}
            >
              {testo}
            </div>
            <div className="lg:col-span-5">{immagine}</div>
          </div>
        )}
      </div>
    </section>
  );
}
