"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, CalendarCheck } from "lucide-react";

interface NavItem {
  label: string;
  href: string;
}

interface NavbarProps {
  items?: readonly NavItem[];
  ctaLabel?: string;
  ctaHref?: string;
  whatsapp?: string;
  telefono?: string;
}

export default function Navbar({
  items,
  ctaLabel = "Prenota Posto",
  ctaHref = "/ludoteca-e-laboratori#prenotazioni",
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navLinks: readonly NavItem[] =
    items && items.length > 0
      ? items
      : [
          { label: "Home", href: "/" },
          { label: "Chi Siamo & Spazi", href: "/chi-siamo" },
          { label: "Ludoteca & Prenotazioni", href: "/ludoteca-e-laboratori" },
          { label: "Orari & Contatti", href: "/contatti" },
        ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-lupetti-teal/15">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-24 flex items-center justify-between">
        {/* Full Logo in Header */}
        <Link href="/" className="flex items-center py-2 group">
          <img
            src="/images/logo.webp"
            alt="I Lupetti - Giocattoleria e Ludoteca"
            className="h-16 sm:h-20 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-bold transition-colors ${
                  isActive
                    ? "text-lupetti-tealDark"
                    : "text-slate-600 hover:text-lupetti-tealDark"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Clean CTA to Booking */}
        <div className="hidden sm:flex items-center">
          <Link
            href={ctaHref}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold text-white bg-lupetti-teal hover:bg-lupetti-tealDark transition-colors shadow-sm"
          >
            <CalendarCheck className="w-4 h-4" />
            <span>{ctaLabel}</span>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Menu"
          className="md:hidden p-2.5 rounded-2xl bg-lupetti-tealLight text-lupetti-tealDark"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-lupetti-teal/15 px-4 pt-2 pb-5 shadow-lg">
          <div className="flex flex-col gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-3 text-base font-bold transition-colors ${
                    isActive
                      ? "text-lupetti-tealDark"
                      : "text-slate-700 hover:text-lupetti-tealDark"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            <Link
              href={ctaHref}
              onClick={() => setMobileMenuOpen(false)}
              className="mt-3 py-3 rounded-2xl font-bold text-center text-white bg-lupetti-teal flex items-center justify-center gap-2"
            >
              <CalendarCheck className="w-4 h-4" />
              <span>{ctaLabel}</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
