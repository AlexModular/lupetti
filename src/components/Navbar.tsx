"use client";

import { Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import type { OrariSettimanali } from "@/lib/orari";
import type { LinkValue } from "@/types";

import logo from "../../public/images/logo.webp";
import ApertoOra from "./ApertoOra";
import SmartLink from "./SmartLink";

interface NavbarProps {
  items: LinkValue[];
  cta?: LinkValue | null;
  nomeAttivita: string;
  /** Orari di apertura, per il pallino "Aperto / Chiuso" a destra. */
  orari?: OrariSettimanali | null;
}

/**
 * Testata nello stile di Da Lucia: le voci del menu si dividono a metà ai lati
 * del logo, che sta al centro della barra.
 * Sul telefono il menu diventa un pannello che entra da sinistra.
 * Scorrendo in giù la testata scompare per lasciare spazio alla pagina;
 * appena si scorre in su ricompare.
 */
export default function Navbar({ items, cta, nomeAttivita, orari }: NavbarProps) {
  const [menuAperto, setMenuAperto] = useState(false);
  const pathname = usePathname();

  const [nascosta, setNascosta] = useState(false);

  // Cambiando pagina il pannello del telefono si richiude.
  useEffect(() => setMenuAperto(false), [pathname]);

  useEffect(() => {
    let ultima = window.scrollY;
    const suScorrimento = () => {
      const y = window.scrollY;
      // I piccoli movimenti non contano; in cima alla pagina resta sempre visibile.
      if (Math.abs(y - ultima) < 8) return;
      setNascosta(y > ultima && y > 140);
      ultima = y;
    };
    window.addEventListener("scroll", suScorrimento, { passive: true });
    return () => window.removeEventListener("scroll", suScorrimento);
  }, []);

  const voci = items.filter((v) => v.label && v.href);
  const haCta = Boolean(cta?.label && cta.href);
  // Le voci si dividono a metà ai lati del logo. Il bottone sta a destra e
  // conta come una voce, così i due lati restano bilanciati.
  const meta = Math.ceil((voci.length + (haCta ? 1 : 0)) / 2);
  const sinistra = voci.slice(0, meta);
  const destra = voci.slice(meta);
  const isAttiva = (href?: string | null) => href?.split("#")[0] === pathname;

  const elenco = (gruppo: LinkValue[]) =>
    gruppo.map((voce) => (
      <li key={voce._key || voce.href}>
        <SmartLink
          href={voce.href}
          className={`voce-menu font-display font-medium uppercase text-lg ${
            isAttiva(voce.href) ? "attiva" : ""
          }`}
        >
          {voce.label}
        </SmartLink>
      </li>
    ));

  return (
    <header
      className={`testata sticky top-0 z-40 bg-white ${
        nascosta && !menuAperto ? "nascosta" : ""
      }`}
      // Arrivando con il tasto Tab su una voce del menu la testata ricompare.
      onFocus={() => setNascosta(false)}
    >
      <nav
        className="relative max-w-screen-2xl mx-auto px-4 xl:px-6 h-[70px] xl:h-[92px] flex items-center justify-between"
        aria-label="Menu principale"
      >
        <ul className="menu-sinistra hidden xl:flex flex-1 items-center justify-start gap-6 pr-20">
          {elenco(sinistra)}
        </ul>

        <div className="logo-centrale">
          <Link href="/" className="block">
            <Image
              src={logo}
              alt={nomeAttivita}
              priority
              sizes="130px"
              className="h-[54px] xl:h-[78px] w-auto object-contain"
            />
          </Link>
        </div>

        <ul className="menu-destra hidden xl:flex flex-1 items-center justify-end gap-6 pl-20">
          {elenco(destra)}
          {haCta && (
            <li>
              <SmartLink href={cta?.href} className="btn-pieno !py-2 !px-4">
                {cta?.label}
              </SmartLink>
            </li>
          )}
          {orari && (
            <li>
              <ApertoOra orari={orari} testata />
            </li>
          )}
        </ul>

        {/* Su telefono e tablet il pallino sta accanto al tasto del menu. */}
        {orari && (
          <div className="xl:hidden ml-auto mr-2">
            <ApertoOra orari={orari} testata />
          </div>
        )}

        <button
          type="button"
          onClick={() => setMenuAperto(true)}
          aria-label="Apri il menu"
          aria-expanded={menuAperto}
          className="xl:hidden p-2 text-slate-700"
        >
          <Menu className="w-8 h-8" aria-hidden />
        </button>
      </nav>

      {/* Pannello del menu su telefono e tablet */}
      <div
        className={`xl:hidden fixed inset-0 z-50 min-h-screen bg-white/90 backdrop-blur backdrop-saturate-150 shadow-lg transform transition-transform duration-300 ease-in-out ${
          menuAperto ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-hidden={!menuAperto}
      >
        <div className="flex items-center justify-between h-[70px] px-4 bg-white border-b-2 border-lupetti-teal">
          <Link href="/" onClick={() => setMenuAperto(false)} tabIndex={menuAperto ? 0 : -1}>
            <Image
              src={logo}
              alt={nomeAttivita}
              sizes="90px"
              className="h-[54px] w-auto object-contain"
            />
          </Link>
          <button
            type="button"
            onClick={() => setMenuAperto(false)}
            aria-label="Chiudi il menu"
            tabIndex={menuAperto ? 0 : -1}
            className="p-2 text-slate-700"
          >
            <X className="w-8 h-8" aria-hidden />
          </button>
        </div>
        <ul className="flex flex-col gap-2 p-6">
          {voci.map((voce) => (
            <li key={voce._key || voce.href}>
              <SmartLink
                href={voce.href}
                onClick={() => setMenuAperto(false)}
                className={`block py-2 font-display font-medium uppercase text-2xl ${
                  isAttiva(voce.href) ? "text-lupetti-tealDark" : "text-slate-700"
                }`}
              >
                {voce.label}
              </SmartLink>
            </li>
          ))}
          {haCta && (
            <li className="pt-4">
              <SmartLink
                href={cta?.href}
                onClick={() => setMenuAperto(false)}
                className="btn-pieno w-full"
              >
                {cta?.label}
              </SmartLink>
            </li>
          )}
        </ul>
      </div>
    </header>
  );
}
