import Image from "next/image";

import SanityImage from "@/components/SanityImage";
import SmartLink from "@/components/SmartLink";
import type { BannerBlock } from "@/types";

import logo from "../../../public/images/logo.webp";

/**
 * Banner di apertura, nello stile di Da Lucia: tutto centrato, titolo grande
 * in maiuscolo nel colore d'accento, sotto il testo e i bottoni.
 * Con "Mostra il riquadro con immagine" compare sopra il titolo l'immagine
 * scelta (o il logo, se non ce n'è una).
 */
export default function Banner({ item }: { item: BannerBlock }) {
  const conImmagine = item.showLogoCard !== false;

  return (
    <section className="bg-gradient-to-b from-lupetti-tealLight/50 via-lupetti-skyLight/25 to-white">
      <div className="max-w-5xl mx-auto px-6 sm:px-12 pt-12 sm:pt-16 pb-14 sm:pb-20 text-center">
        {conImmagine && (
          <div className="flex justify-center mb-8">
            {item.image?.asset?._ref ? (
              <SanityImage
                image={item.image}
                alt={item.heading || "I Lupetti"}
                width={720}
                sizes="360px"
                priority
                className="w-full max-w-[360px] h-auto object-contain"
              />
            ) : (
              <Image
                src={logo}
                alt="I Lupetti · Giocattoleria e Ludoteca"
                priority
                sizes="360px"
                className="w-full max-w-[360px] h-auto object-contain"
              />
            )}
          </div>
        )}

        {item.heading && (
          <h1 className="font-display font-semibold uppercase tracking-wide text-lupetti-tealDark text-3xl sm:text-5xl lg:text-[3.4rem] leading-tight text-balance">
            {item.heading}
          </h1>
        )}

        {item.badge && (
          <p className="mt-4 font-display font-medium text-lg sm:text-2xl text-lupetti-skyDark">
            {item.badge}
          </p>
        )}

        {item.subheading && (
          <p className="mt-6 text-slate-600 leading-relaxed max-w-3xl mx-auto">
            {item.subheading}
          </p>
        )}

        {(item.cta?.label || item.secondaryCta?.label) && (
          <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-4">
            {item.cta?.label && (
              <SmartLink href={item.cta.href} className="btn-pieno w-full sm:w-auto">
                {item.cta.label}
              </SmartLink>
            )}
            {item.secondaryCta?.label && (
              <SmartLink
                href={item.secondaryCta.href}
                className="btn-bordo w-full sm:w-auto"
              >
                {item.secondaryCta.label}
              </SmartLink>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
