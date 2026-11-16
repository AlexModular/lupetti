import { ChevronsUp, Facebook, Instagram, Mail, MapPin, Phone } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { riepilogoOrari } from "@/lib/orari";
import { indirizzoCompleto, telefonoHref } from "@/lib/sito";
import type { Impostazioni, LinkValue } from "@/types";

import logo from "../../public/images/logo.webp";
import ApertoOra from "./ApertoOra";
import SmartLink from "./SmartLink";

interface FooterProps {
  impostazioni: Impostazioni | null;
  voci: LinkValue[];
}

/**
 * Piè di pagina nello stile di Da Lucia: bordo spesso in alto, logo grande a
 * sinistra, "Dove siamo", orari e social, tasto "torna su" e riga finale.
 */
export default function Footer({ impostazioni, voci }: FooterProps) {
  const nome = impostazioni?.nomeAttivita || "I Lupetti";
  const indirizzo = indirizzoCompleto(impostazioni);
  const orari = riepilogoOrari(impostazioni?.orari);
  const haOrari = orari.some((r) => r.orari.length > 0);
  const haSocial = Boolean(impostazioni?.instagramUrl || impostazioni?.facebookUrl);
  const icona = "w-4 h-4 inline-block mr-2 -mt-0.5 text-lupetti-teal";

  return (
    <footer className="piede mt-auto bg-white pt-6 pb-6 text-slate-700">
      <div className="max-w-7xl mx-auto px-5 py-7 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-x-8 gap-y-10 text-center md:text-left">
        <div className="md:col-span-2 lg:col-span-4 flex flex-col items-center">
          <Link href="/">
            <Image
              src={logo}
              alt={nome}
              sizes="340px"
              className="w-full max-w-[340px] h-auto"
            />
          </Link>
          {impostazioni?.descrizioneBreve && (
            <p className="mt-4 text-sm text-center max-w-sm leading-relaxed">
              {impostazioni.descrizioneBreve}
            </p>
          )}
        </div>

        <div className="lg:col-span-3">
          <h2>Dove siamo</h2>
          <ul className="space-y-2">
            {indirizzo && (
              <li>
                <MapPin className={icona} aria-hidden />
                {indirizzo}
              </li>
            )}
            {impostazioni?.telefono && (
              <li>
                <Phone className={icona} aria-hidden />
                <a
                  href={telefonoHref(impostazioni.telefono)}
                  className="hover:text-lupetti-tealDark"
                >
                  {impostazioni.telefono}
                </a>
              </li>
            )}
            {impostazioni?.email && (
              <li>
                <Mail className={icona} aria-hidden />
                <a
                  href={`mailto:${impostazioni.email}`}
                  className="hover:text-lupetti-tealDark break-all"
                >
                  {impostazioni.email}
                </a>
              </li>
            )}
          </ul>
        </div>

        {haOrari && (
          <div className="lg:col-span-3">
            <h2>Orari</h2>
            <dl className="space-y-1.5 inline-block text-left">
              {orari.map((riga) => (
                <div key={riga.giorni} className="flex gap-3">
                  <dt className="font-display font-semibold uppercase w-24 shrink-0">
                    {riga.giorni}
                  </dt>
                  <dd>
                    {riga.orari.length
                      ? riga.orari.map((o) => <div key={o}>{o}</div>)
                      : "Chiuso"}
                  </dd>
                </div>
              ))}
            </dl>
            {impostazioni?.notaOrari && (
              <p className="mt-2 text-sm italic">{impostazioni.notaOrari}</p>
            )}
            <div className="mt-3">
              <ApertoOra orari={impostazioni?.orari} />
            </div>
          </div>
        )}

        <div className="lg:col-span-2">
          <h2>{haSocial ? "Seguici" : "Il sito"}</h2>
          {haSocial && (
            <div className="flex justify-center md:justify-start gap-4 mb-5">
              {impostazioni?.instagramUrl && (
                <a
                  href={impostazioni.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="hover:text-lupetti-tealDark transition-colors"
                >
                  <Instagram className="w-7 h-7" aria-hidden />
                </a>
              )}
              {impostazioni?.facebookUrl && (
                <a
                  href={impostazioni.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="hover:text-lupetti-tealDark transition-colors"
                >
                  <Facebook className="w-7 h-7" aria-hidden />
                </a>
              )}
            </div>
          )}
          <ul className="space-y-1.5 text-sm">
            {voci
              .filter((v) => v.label && v.href)
              .map((voce) => (
                <li key={voce._key || voce.href}>
                  <SmartLink href={voce.href} className="hover:text-lupetti-tealDark">
                    {voce.label}
                  </SmartLink>
                </li>
              ))}
            {impostazioni?.privacyHref && (
              <li>
                <Link
                  href={impostazioni.privacyHref}
                  className="hover:text-lupetti-tealDark"
                >
                  Privacy
                </Link>
              </li>
            )}
          </ul>
        </div>
      </div>

      <div className="barra-finale text-center text-sm px-4">
        <a href="#contenuto" className="torna-su" aria-label="Torna su">
          <ChevronsUp className="w-7 h-7" aria-hidden />
        </a>
        <p>
          © {new Date().getFullYear()} {nome}
        </p>
        <p className="mt-1 text-xs text-slate-500">
          <Link href="/studio" className="hover:text-lupetti-tealDark">
            Area riservata
          </Link>
        </p>
      </div>
    </footer>
  );
}
