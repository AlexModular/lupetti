import type { Metadata } from "next";
import { draftMode } from "next/headers";
import { notFound, permanentRedirect } from "next/navigation";

import PageIntro from "@/components/PageIntro";
import PageMaker from "@/components/PageMaker";
import { client } from "@/sanity/lib/client";
import { getPagina, getSito } from "@/sanity/lib/fetch";
import { PAGE_SLUGS_QUERY } from "@/sanity/lib/queries";

type Props = { params: Promise<{ slug: string }> };

/** Le pagine esistenti vengono preparate in anticipo; le nuove al primo accesso. */
export async function generateStaticParams() {
  const pagine = await client
    .withConfig({ stega: false })
    .fetch<{ slug: string }[]>(PAGE_SLUGS_QUERY);
  return pagine.filter((p) => p.slug !== "home").map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPagina(slug);
  if (!page) return { title: "Pagina non trovata" };
  return {
    title: page.metaTitle ? { absolute: page.metaTitle } : page.title,
    description: page.metaDescription || page.subtitle || undefined,
    alternates: { canonical: `/${slug}` },
  };
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  // La home vive su "/": un solo indirizzo per pagina.
  if (slug === "home") permanentRedirect("/");

  const [page, { impostazioni }, anteprima] = await Promise.all([
    getPagina(slug),
    getSito(),
    draftMode(),
  ]);
  if (!page) notFound();

  return (
    <>
      <PageIntro
        title={page.title}
        subtitle={page.subtitle}
        introImage={page.introImage}
      />
      <PageMaker
        page={page}
        impostazioni={impostazioni}
        anteprima={anteprima.isEnabled}
      />
    </>
  );
}
