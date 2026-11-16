import type { Impostazioni } from "@/types";

/** Indirizzo pubblico del sito, usato per link assoluti, sitemap e anteprime. */
export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000")
).replace(/\/$/, "");

/** "Via Savigno, 1/a, 40141 Bologna (BO)" */
export function indirizzoCompleto(i: Impostazioni | null | undefined) {
  if (!i) return "";
  const localita = [i.cap, i.citta].filter(Boolean).join(" ");
  return [
    i.via,
    [localita, i.provincia ? `(${i.provincia})` : null].filter(Boolean).join(" "),
  ]
    .filter(Boolean)
    .join(", ");
}

/** Link che apre WhatsApp con un messaggio già scritto. */
export function whatsappUrl(numero: string | null | undefined, messaggio?: string) {
  const cifre = (numero ?? "").replace(/\D/g, "");
  if (!cifre) return null;
  return `https://wa.me/${cifre}${
    messaggio ? `?text=${encodeURIComponent(messaggio)}` : ""
  }`;
}

export const telefonoHref = (telefono: string) =>
  `tel:${telefono.replace(/[^\d+]/g, "")}`;
