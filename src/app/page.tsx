import React from "react";
import { getSiteData, getPageBySlug } from "@/lib/content";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageMaker from "@/components/PageMaker";

export default async function HomePage() {
  const [siteData, homePage] = await Promise.all([
    getSiteData(),
    getPageBySlug("home"),
  ]);

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
        {homePage && <PageMaker page={homePage} siteData={siteData} />}
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
