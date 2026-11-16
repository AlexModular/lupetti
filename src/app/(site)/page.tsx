import type { Metadata } from "next";
import { draftMode } from "next/headers";

import PageMaker from "@/components/PageMaker";
import { getPagina, getSito } from "@/sanity/lib/fetch";

/** La home è la pagina con indirizzo "home". */
export async function generateMetadata(): Promise<Metadata> {
  const page = await getPagina("home");
  return {
    ...(page?.metaTitle ? { title: { absolute: page.metaTitle } } : {}),
    ...(page?.metaDescription ? { description: page.metaDescription } : {}),
    alternates: { canonical: "/" },
  };
}

export default async function HomePage() {
  const [page, { impostazioni }, anteprima] = await Promise.all([
    getPagina("home"),
    getSito(),
    draftMode(),
  ]);

  if (!page) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <h1 className="font-display text-3xl font-bold text-slate-800">
          Il sito è quasi pronto
        </h1>
        <p className="mt-3 text-slate-600">
          Manca la pagina con indirizzo «home». Creala nello Studio, sezione
          Pagine.
        </p>
      </div>
    );
  }

  return (
    <PageMaker
      page={page}
      impostazioni={impostazioni}
      anteprima={anteprima.isEnabled}
    />
  );
}
