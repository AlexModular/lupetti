import React from "react";
import Link from "next/link";
import { CalendarCheck, ArrowRight } from "lucide-react";

export interface BannerBlockProps {
  badge?: string;
  heading?: string;
  subheading?: string;
  image?: string | null;
  showLogoCard?: boolean;
  ctaLabel?: string;
  ctaHref?: string;
  secondaryCtaLabel?: string;
  secondaryCtaHref?: string;
}

export default function Banner({ item }: { item: BannerBlockProps }) {
  const showLogoCard = item.showLogoCard ?? true;

  return (
    <section className="py-14 sm:py-22 bg-gradient-to-b from-lupetti-tealLight/50 via-lupetti-skyLight/25 to-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`grid grid-cols-1 ${
            showLogoCard ? "lg:grid-cols-12" : ""
          } gap-10 items-center`}
        >
          <div
            className={
              showLogoCard
                ? "lg:col-span-7 text-center lg:text-left"
                : "max-w-3xl mx-auto text-center"
            }
          >
            {item.badge && (
              <span className="inline-block px-4 py-1.5 rounded-full bg-white border border-lupetti-teal/25 text-lupetti-tealDark text-xs font-extrabold uppercase tracking-wider mb-5">
                {item.badge}
              </span>
            )}

            {item.heading && (
              <h1 className="font-display text-3xl sm:text-5xl font-bold text-slate-800 leading-tight">
                {item.heading}
              </h1>
            )}

            {item.subheading && (
              <p className="mt-5 text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl mx-auto lg:mx-0">
                {item.subheading}
              </p>
            )}

            {(item.ctaLabel || item.secondaryCtaLabel) && (
              <div
                className={`mt-8 flex flex-col sm:flex-row items-center ${
                  showLogoCard ? "justify-center lg:justify-start" : "justify-center"
                } gap-3.5`}
              >
                {item.ctaLabel && (
                  <Link
                    href={item.ctaHref || "/ludoteca-e-laboratori"}
                    className="w-full sm:w-auto px-6 py-3.5 rounded-2xl font-display font-bold text-base text-white bg-lupetti-teal hover:bg-lupetti-tealDark transition-colors flex items-center justify-center gap-2 shadow-sm"
                  >
                    <CalendarCheck className="w-5 h-5" />
                    <span>{item.ctaLabel}</span>
                  </Link>
                )}

                {item.secondaryCtaLabel && (
                  <Link
                    href={item.secondaryCtaHref || "/chi-siamo"}
                    className="w-full sm:w-auto px-6 py-3.5 rounded-2xl font-display font-bold text-base text-lupetti-tealDark bg-white hover:bg-lupetti-tealLight/50 border border-lupetti-teal/30 transition-colors flex items-center justify-center gap-2"
                  >
                    <span>{item.secondaryCtaLabel}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                )}
              </div>
            )}
          </div>

          {showLogoCard && (
            <div className="lg:col-span-5 flex justify-center">
              <div className="bg-white rounded-[2rem] p-8 border border-lupetti-teal/15 shadow-soft max-w-sm w-full flex flex-col items-center text-center">
                <img
                  src={item.image || "/images/logo.webp"}
                  alt={item.heading || "I Lupetti"}
                  className="w-full max-w-[290px] h-auto object-contain"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

