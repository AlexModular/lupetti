import React from "react";
import GallerySection, { GalleryItem } from "@/components/GallerySection";

export interface GalleryBlockProps {
  tagline?: string;
  heading?: string;
}

export default function Gallery({
  item,
  galleria,
}: {
  item: GalleryBlockProps;
  galleria: GalleryItem[];
}) {
  return (
    <section className="py-14 sm:py-18 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          {item.tagline && (
            <span className="text-xs font-extrabold uppercase tracking-wider text-lupetti-skyDark">
              {item.tagline}
            </span>
          )}
          {item.heading && (
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-800 mt-1">
              {item.heading}
            </h2>
          )}
        </div>

        <GallerySection items={galleria} />
      </div>
    </section>
  );
}

