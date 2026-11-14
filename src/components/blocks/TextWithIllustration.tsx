import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export interface TextWithIllustrationBlockProps {
  tagline?: string;
  heading?: string;
  text?: string;
  secondaryText?: string;
  image?: string | null;
  imagePosition?: "left" | "right" | "top" | "bottom";
  backgroundStyle?: "white" | "teal" | "sky";
  ctaLabel?: string;
  ctaHref?: string;
}

export default function TextWithIllustration({
  item,
}: {
  item: TextWithIllustrationBlockProps;
}) {
  const pos = item.imagePosition || "right";
  const bgClass =
    item.backgroundStyle === "teal"
      ? "bg-gradient-to-b from-lupetti-tealLight/40 to-white"
      : item.backgroundStyle === "sky"
      ? "bg-gradient-to-b from-lupetti-skyLight/40 to-white"
      : "bg-white";

  const isVertical = pos === "top" || pos === "bottom";

  const renderImage = () =>
    item.image ? (
      <div className="flex justify-center">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-lupetti-teal/20 shadow-card flex flex-col items-center text-center max-w-sm w-full">
          <img
            src={item.image}
            alt={item.heading || "Illustrazione"}
            className="w-52 h-auto object-contain"
          />
          <p className="mt-4 font-display font-bold text-sm text-lupetti-tealDark">
            Giocattoleria ★ Ludoteca
          </p>
        </div>
      </div>
    ) : null;

  return (
    <section className={`py-14 sm:py-20 ${bgClass}`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {isVertical ? (
          <div className="max-w-3xl mx-auto text-center space-y-8">
            {pos === "top" && renderImage()}
            <div>
              {item.tagline && (
                <span className="text-xs font-extrabold uppercase tracking-wider text-lupetti-teal">
                  {item.tagline}
                </span>
              )}
              {item.heading && (
                <h2 className="font-display text-3xl sm:text-4xl font-bold text-slate-800 mt-1">
                  {item.heading}
                </h2>
              )}
              {item.text && (
                <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
                  {item.text}
                </p>
              )}
              {item.secondaryText && (
                <p className="mt-3 text-base sm:text-lg text-slate-600 leading-relaxed">
                  {item.secondaryText}
                </p>
              )}
              {item.ctaLabel && (
                <div className="mt-6">
                  <Link
                    href={item.ctaHref || "/"}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-lupetti-teal text-white text-sm font-bold hover:bg-lupetti-tealDark transition-colors"
                  >
                    <span>{item.ctaLabel}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              )}
            </div>
            {pos === "bottom" && renderImage()}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {pos === "left" && (
              <div className="lg:col-span-5">{renderImage()}</div>
            )}

            <div className="lg:col-span-7">
              {item.tagline && (
                <span className="text-xs font-extrabold uppercase tracking-wider text-lupetti-teal">
                  {item.tagline}
                </span>
              )}
              {item.heading && (
                <h2 className="font-display text-3xl sm:text-4xl font-bold text-slate-800 mt-1">
                  {item.heading}
                </h2>
              )}
              {item.text && (
                <p className="mt-5 text-base sm:text-lg text-slate-600 leading-relaxed">
                  {item.text}
                </p>
              )}
              {item.secondaryText && (
                <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
                  {item.secondaryText}
                </p>
              )}
              {item.ctaLabel && (
                <div className="mt-6">
                  <Link
                    href={item.ctaHref || "/"}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-lupetti-teal text-white text-sm font-bold hover:bg-lupetti-tealDark transition-colors"
                  >
                    <span>{item.ctaLabel}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              )}
            </div>

            {pos === "right" && (
              <div className="lg:col-span-5">{renderImage()}</div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

