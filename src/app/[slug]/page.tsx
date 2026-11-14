import React from "react";
import { notFound } from "next/navigation";
import { getSiteData, getPageBySlug, getAllPageSlugs } from "@/lib/content";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageIntro from "@/components/PageIntro";
import PageMaker from "@/components/PageMaker";

export async function generateStaticParams() {
  const slugs = await getAllPageSlugs();
  return slugs
    .filter((slug) => slug !== "home")
    .map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}) {
  const page = await getPageBySlug(params.slug);
  if (!page) {
    return {
      title: "Pagina non trovata | I Lupetti",
    };
  }
  return {
    title: page.metaTitle || `${page.title} | I Lupetti • Giocattoleria & Ludoteca`,
    description: page.metaDescription || page.subtitle || undefined,
  };
}

export default async function DynamicCmsPage({
  params,
}: {
  params: { slug: string };
}) {
  const [siteData, page] = await Promise.all([
    getSiteData(),
    getPageBySlug(params.slug),
  ]);

  if (!page) {
    notFound();
  }

  const { navigation, impostazioni } = siteData;

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar
        items={navigation.items}
        ctaLabel={navigation.ctaLabel}
        ctaHref={navigation.ctaHref}
        whatsapp={impostazioni.whatsapp}
        telefono={impostazioni.telefono}
      />

      <main className="flex-1">
        <PageIntro
          title={page.title}
          subtitle={page.subtitle}
          introImage={page.introImage}
        />
        <PageMaker page={page} siteData={siteData} />
      </main>

      <Footer
        nomeAttivita={impostazioni.nomeAttivita}
        indirizzo={impostazioni.indirizzo}
        telefono={impostazioni.telefono}
        email={impostazioni.email}
        orariMattina={impostazioni.orariMattina}
        orariPomeriggio={impostazioni.orariPomeriggio}
        instagramUrl={impostazioni.instagramUrl}
        facebookUrl={impostazioni.facebookUrl}
      />
    </div>
  );
}

