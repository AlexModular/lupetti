import type { Metadata, Viewport } from "next";
import { Fredoka, Nunito } from "next/font/google";
import { draftMode } from "next/headers";
import { VisualEditing } from "next-sanity";

import { DisableDraftMode } from "@/components/DisableDraftMode";
import Footer from "@/components/Footer";
import JsonLdAttivita from "@/components/JsonLdAttivita";
import Navbar from "@/components/Navbar";
import ScrollReveal from "@/components/ScrollReveal";
import { siteUrl } from "@/lib/sito";
import { getSito } from "@/sanity/lib/fetch";
import { urlFor } from "@/sanity/lib/image";
import { SanityLive } from "@/sanity/lib/live";

import "../globals.css";

// I caratteri vengono scaricati in fase di build e serviti dal sito stesso:
// nessuna richiesta a Google dal browser dei visitatori.
const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-nunito",
  display: "swap",
});
const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-fredoka",
  display: "swap",
});

const TITOLO = "I Lupetti • Giocattoleria e Ludoteca";
const DESCRIZIONE =
  "Giocattoleria educativa e ludoteca per bambini: laboratori creativi, baby parking, feste di compleanno e giochi selezionati.";

export async function generateMetadata(): Promise<Metadata> {
  const { impostazioni } = await getSito();
  const nome = impostazioni?.nomeAttivita || TITOLO;
  const titolo = impostazioni?.metaTitle || nome;
  const descrizione =
    impostazioni?.metaDescription || impostazioni?.descrizioneBreve || DESCRIZIONE;
  const immagine = impostazioni?.ogImage?.asset?._ref
    ? urlFor(impostazioni.ogImage).width(1200).height(630).fit("crop").url()
    : "/images/logo.png";

  return {
    metadataBase: new URL(siteUrl),
    title: { default: titolo, template: `%s | ${nome}` },
    description: descrizione,
    openGraph: {
      type: "website",
      locale: "it_IT",
      siteName: nome,
      title: titolo,
      description: descrizione,
      images: [{ url: immagine }],
    },
    icons: {
      icon: [
        { url: "/favicon.ico", sizes: "any" },
        { url: "/favicon.png", type: "image/png" },
      ],
      apple: "/apple-touch-icon.png",
    },
  };
}

export const viewport: Viewport = {
  themeColor: "#4EA898",
};

export default async function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [{ impostazioni, navigation }, anteprima] = await Promise.all([
    getSito(),
    draftMode(),
  ]);
  const voci = navigation?.items ?? [];

  return (
    <html lang="it" className={`${nunito.variable} ${fredoka.variable}`}>
      <body className="font-sans min-h-screen flex flex-col bg-white">
        <a
          href="#contenuto"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:rounded-full focus:bg-white focus:shadow-lg focus:font-bold"
        >
          Vai al contenuto
        </a>
        <Navbar
          items={voci}
          cta={navigation?.cta}
          nomeAttivita={impostazioni?.nomeAttivita || TITOLO}
        />
        <main id="contenuto" className="flex-1">
          {children}
        </main>
        <Footer impostazioni={impostazioni} voci={voci} />
        <JsonLdAttivita impostazioni={impostazioni} />
        <ScrollReveal />
        <SanityLive />
        {anteprima.isEnabled && (
          <>
            <DisableDraftMode />
            <VisualEditing />
          </>
        )}
      </body>
    </html>
  );
}
