import { GIORNI, isOrario, type Giorno } from "@/lib/orari";
import { siteUrl } from "@/lib/sito";
import type { Impostazioni } from "@/types";

const GIORNI_SCHEMA: Record<Giorno, string> = {
  lunedi: "Monday",
  martedi: "Tuesday",
  mercoledi: "Wednesday",
  giovedi: "Thursday",
  venerdi: "Friday",
  sabato: "Saturday",
  domenica: "Sunday",
};

/**
 * Dati strutturati dell'attività (schema.org). Non si vedono sulla pagina:
 * servono a Google per mostrare indirizzo, telefono e orari nei risultati.
 */
export default function JsonLdAttivita({
  impostazioni,
}: {
  impostazioni: Impostazioni | null;
}) {
  if (!impostazioni?.nomeAttivita) return null;

  const orari = GIORNI.flatMap((giorno) =>
    (impostazioni.orari?.[giorno] ?? [])
      .filter((f) => f && isOrario(f.dalle) && isOrario(f.alle))
      .map((f) => ({
        "@type": "OpeningHoursSpecification",
        dayOfWeek: GIORNI_SCHEMA[giorno],
        opens: f.dalle,
        closes: f.alle,
      }))
  );

  const dati = {
    "@context": "https://schema.org",
    "@type": "ToyStore",
    name: impostazioni.nomeAttivita,
    url: siteUrl,
    image: `${siteUrl}/images/logo.png`,
    ...(impostazioni.descrizioneBreve
      ? { description: impostazioni.descrizioneBreve }
      : {}),
    ...(impostazioni.telefono ? { telephone: impostazioni.telefono } : {}),
    ...(impostazioni.email ? { email: impostazioni.email } : {}),
    ...(impostazioni.via
      ? {
          address: {
            "@type": "PostalAddress",
            streetAddress: impostazioni.via,
            postalCode: impostazioni.cap,
            addressLocality: impostazioni.citta,
            addressRegion: impostazioni.provincia,
            addressCountry: "IT",
          },
        }
      : {}),
    ...(orari.length ? { openingHoursSpecification: orari } : {}),
    sameAs: [impostazioni.instagramUrl, impostazioni.facebookUrl].filter(Boolean),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(dati).replace(/</g, "\\u003c"),
      }}
    />
  );
}
