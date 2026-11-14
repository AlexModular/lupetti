import React from "react";
import Link from "next/link";
import { Check, ArrowRight } from "lucide-react";

export interface ServiceEntry {
  slug: string;
  title: string;
  badge: string;
  themeColor: string;
  description: string;
  priceInfo: string;
  features: readonly string[];
}

export interface ServicesListBlockProps {
  tagline?: string;
  heading?: string;
  showLinkToPage?: boolean;
}

export default function ServicesList({
  item,
  servizi,
}: {
  item: ServicesListBlockProps;
  servizi: ServiceEntry[];
}) {
  return (
    <section className="py-14 sm:py-18 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            {item.tagline && (
              <span className="text-xs font-extrabold uppercase tracking-wider text-lupetti-teal">
                {item.tagline}
              </span>
            )}
            {item.heading && (
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-800 mt-1">
                {item.heading}
              </h2>
            )}
          </div>
          {item.showLinkToPage && (
            <Link
              href="/ludoteca-e-laboratori"
              className="text-sm font-extrabold text-lupetti-tealDark hover:text-lupetti-skyDark inline-flex items-center gap-1"
            >
              <span>Approfondisci e prenota</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {servizi.map((servizio) => (
            <div
              key={servizio.slug}
              className="rounded-3xl p-6 bg-lupetti-tealLight/25 border border-lupetti-teal/15 flex flex-col justify-between"
            >
              <div>
                <span className="inline-block px-3 py-1 rounded-full text-xs font-extrabold bg-white text-lupetti-tealDark border border-lupetti-teal/15 mb-3">
                  {servizio.badge}
                </span>
                <h3 className="font-display text-xl font-bold text-slate-800">
                  {servizio.title}
                </h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                  {servizio.description}
                </p>
                <ul className="mt-4 space-y-2">
                  {servizio.features.map((f, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-xs font-semibold text-slate-700"
                    >
                      <Check className="w-3.5 h-3.5 text-lupetti-teal shrink-0 mt-0.5 stroke-[3]" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-6 pt-4 border-t border-lupetti-teal/10">
                <span className="text-xs font-extrabold text-lupetti-skyDark">
                  {servizio.priceInfo}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

