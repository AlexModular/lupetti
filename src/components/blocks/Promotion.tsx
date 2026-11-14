import React from "react";
import Link from "next/link";

export interface PromotionBlockProps {
  badge?: string;
  title?: string;
  text?: string;
  ctaLabel?: string;
  ctaHref?: string;
}

export default function Promotion({ item }: { item: PromotionBlockProps }) {
  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto rounded-3xl bg-gradient-to-r from-lupetti-tealLight via-lupetti-skyLight to-lupetti-tealLight/60 p-8 sm:p-10 border border-lupetti-teal/20 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="max-w-2xl">
          {item.badge && (
            <span className="inline-block px-3 py-1 rounded-full bg-white text-lupetti-tealDark text-xs font-extrabold uppercase tracking-wider mb-2">
              {item.badge}
            </span>
          )}
          {item.title && (
            <h3 className="font-display text-2xl sm:text-3xl font-bold text-slate-800">
              {item.title}
            </h3>
          )}
          {item.text && (
            <p className="text-sm sm:text-base text-slate-600 mt-2">
              {item.text}
            </p>
          )}
        </div>
        {item.ctaLabel && (
          <Link
            href={item.ctaHref || "/contatti"}
            className="shrink-0 px-6 py-3.5 rounded-2xl bg-lupetti-teal text-white font-display font-bold text-sm hover:bg-lupetti-tealDark transition-colors shadow-sm"
          >
            {item.ctaLabel}
          </Link>
        )}
      </div>
    </section>
  );
}

