import React from "react";
import Link from "next/link";
import { Instagram, Facebook, Settings, ClipboardList } from "lucide-react";

interface FooterProps {
  nomeAttivita: string;
  indirizzo: string;
  telefono: string;
  email: string;
  orariMattina: string;
  orariPomeriggio: string;
  instagramUrl: string;
  facebookUrl: string;
}

export default function Footer({
  nomeAttivita,
  indirizzo,
  telefono,
  email,
  orariMattina,
  orariPomeriggio,
  instagramUrl,
  facebookUrl,
}: FooterProps) {
  return (
    <footer className="bg-lupetti-tealLight/35 border-t border-lupetti-teal/15 text-slate-600 mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-8 border-b border-lupetti-teal/15 items-start">
          {/* Logo & Info */}
          <div className="md:col-span-5">
            <Link href="/" className="inline-block">
              <img
                src="/images/logo.webp"
                alt="I Lupetti Logo"
                className="h-20 w-auto object-contain"
              />
            </Link>
            <p className="mt-3 text-sm text-slate-600 max-w-xs leading-relaxed">
              Giocattoleria educativa e ludoteca con laboratori creativi a numero chiuso e spazio gioco assistito.
            </p>
          </div>

          {/* Pages */}
          <div className="md:col-span-3">
            <h4 className="font-display font-bold text-slate-800 text-base mb-3">
              Navigazione
            </h4>
            <ul className="space-y-2 text-sm font-semibold">
              <li>
                <Link href="/" className="hover:text-lupetti-tealDark transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/chi-siamo" className="hover:text-lupetti-tealDark transition-colors">
                  Chi Siamo &amp; Spazi
                </Link>
              </li>
              <li>
                <Link href="/ludoteca-e-laboratori" className="hover:text-lupetti-tealDark transition-colors">
                  Ludoteca &amp; Prenotazioni
                </Link>
              </li>
              <li>
                <Link href="/contatti" className="hover:text-lupetti-tealDark transition-colors">
                  Orari &amp; Contatti
                </Link>
              </li>
            </ul>
          </div>

          {/* Orari & Contatti */}
          <div className="md:col-span-4 text-sm space-y-1.5">
            <h4 className="font-display font-bold text-slate-800 text-base mb-3">
              Recapiti &amp; Orari
            </h4>
            <p className="font-semibold text-slate-700">{indirizzo}</p>
            <p>Tel: {telefono} • {email}</p>
            <p className="text-xs text-slate-500 pt-1">
              {orariMattina} | {orariPomeriggio}
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-3">
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="p-2 rounded-full bg-white text-lupetti-tealDark hover:bg-lupetti-teal hover:text-white transition-colors shadow-sm"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href={facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="p-2 rounded-full bg-white text-lupetti-skyDark hover:bg-lupetti-sky hover:text-white transition-colors shadow-sm"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <Link
                href="/admin/prenotazioni"
                className="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white text-lupetti-tealDark hover:bg-lupetti-teal hover:text-white text-xs font-bold border border-lupetti-teal/25 transition-colors"
              >
                <ClipboardList className="w-3.5 h-3.5" />
                <span>Registro Prenotazioni</span>
              </Link>
              <Link
                href="/keystatic"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white text-slate-500 hover:text-lupetti-tealDark text-xs font-bold border border-slate-200 transition-colors"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>CMS</span>
              </Link>
            </div>
          </div>
        </div>

        <div className="pt-6 text-center sm:text-left text-xs text-slate-500 flex flex-col sm:flex-row justify-between gap-2">
          <p>© {new Date().getFullYear()} {nomeAttivita}.</p>
          <p>Giocattoleria ★ Ludoteca</p>
        </div>
      </div>
    </footer>
  );
}
