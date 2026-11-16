import Link from "next/link";

import type { SanityImageValue } from "@/types";

import SanityImage from "./SanityImage";

interface PageIntroProps {
  title?: string | null;
  subtitle?: string | null;
  introImage?: SanityImageValue | null;
}

/**
 * Fascia in cima alle pagine interne, come su Da Lucia: titolo grande in
 * maiuscolo su fondo scuro (l'immagine di testata, se c'è, altrimenti una
 * sfumatura nei colori del sito) e sotto la barra con il percorso.
 */
export default function PageIntro({ title, subtitle, introImage }: PageIntroProps) {
  if (!title) return null;

  return (
    <>
      <div className="fascia-titolo">
        {introImage?.asset?._ref && (
          <SanityImage
            image={introImage}
            alt=""
            width={1920}
            aspect={16 / 5}
            priority
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
        <div className="relative z-[2] px-4 text-center" data-reveal="zoom">
          <h1 className="font-display font-semibold uppercase tracking-wide text-white text-4xl sm:text-5xl lg:text-6xl text-balance">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-2 text-white/90 text-base sm:text-xl max-w-2xl mx-auto">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      <nav className="briciole" aria-label="Percorso">
        <ol className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[45px] flex items-center font-display uppercase text-sm sm:text-base text-slate-300">
          <li>
            <Link href="/" className="hover:text-lupetti-teal transition-colors">
              Home
            </Link>
          </li>
          <li className="text-white" aria-current="page">
            {title}
          </li>
        </ol>
      </nav>
    </>
  );
}
