"use client";

import React, { useState } from "react";
import { X, ZoomIn } from "lucide-react";

export interface GalleryItem {
  slug: string;
  title: string;
  category: string;
  caption: string;
  image: string;
}

interface GallerySectionProps {
  items: GalleryItem[];
}

export default function GallerySection({ items }: GallerySectionProps) {
  const [activeCat, setActiveCat] = useState<string>("Tutti");
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);

  const categories = ["Tutti", "Spazi Ludoteca", "Laboratori", "Giocattoleria"];

  const filtered =
    activeCat === "Tutti"
      ? items
      : items.filter((item) => item.category === activeCat);

  return (
    <div>
      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setActiveCat(cat)}
            className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
              activeCat === cat
                ? "bg-lupetti-teal text-white shadow-sm"
                : "bg-white text-slate-600 border border-slate-200 hover:border-lupetti-teal/40"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((item) => (
          <div
            key={item.slug}
            onClick={() => setSelectedItem(item)}
            className="group cursor-pointer bg-white rounded-3xl overflow-hidden border border-lupetti-teal/15 shadow-card hover:shadow-soft transition-all duration-300 flex flex-col"
          >
            <div className="relative aspect-[10/7] overflow-hidden bg-slate-50">
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-3 right-3 p-2 rounded-full bg-white/90 text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity">
                <ZoomIn className="w-4 h-4" />
              </div>
            </div>
            <div className="p-5">
              <span className="text-xs font-extrabold uppercase tracking-wider text-lupetti-teal">
                {item.category}
              </span>
              <h3 className="font-display text-lg font-bold text-slate-800 mt-0.5">
                {item.title}
              </h3>
              <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                {item.caption}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {selectedItem && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative bg-slate-50">
              <img
                src={selectedItem.image}
                alt={selectedItem.title}
                className="w-full max-h-[60vh] object-contain mx-auto"
              />
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                aria-label="Chiudi"
                className="absolute top-4 right-4 p-2 rounded-full bg-white/90 text-slate-800 shadow"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <span className="text-xs font-extrabold uppercase tracking-wider text-lupetti-teal">
                {selectedItem.category}
              </span>
              <h3 className="font-display text-xl font-bold text-slate-800 mt-0.5">
                {selectedItem.title}
              </h3>
              <p className="text-sm text-slate-600 mt-1">{selectedItem.caption}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
