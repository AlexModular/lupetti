"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface SliderBlockProps {
  heading?: string;
  slides?: readonly {
    title: string;
    caption: string;
    image?: string | null;
  }[];
}

export default function Slider({ item }: { item: SliderBlockProps }) {
  const slides = item.slides || [];
  const [idx, setIdx] = useState(0);

  if (slides.length === 0) return null;

  const current = slides[idx] || slides[0];

  return (
    <section className="py-14 bg-lupetti-tealLight/30">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {item.heading && (
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-800 text-center mb-8">
            {item.heading}
          </h2>
        )}

        <div className="relative bg-white rounded-3xl overflow-hidden border border-lupetti-teal/20 shadow-card">
          <div className="aspect-[16/9] bg-slate-50 relative">
            <img
              src={current.image || "/images/gallery/sala-ludoteca.svg"}
              alt={current.title}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="p-6 flex items-center justify-between gap-4">
            <div>
              <h3 className="font-display text-xl font-bold text-slate-800">
                {current.title}
              </h3>
              {current.caption && (
                <p className="text-sm text-slate-600 mt-1">{current.caption}</p>
              )}
            </div>

            {slides.length > 1 && (
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() =>
                    setIdx((prev) => (prev - 1 + slides.length) % slides.length)
                  }
                  className="p-2.5 rounded-full bg-lupetti-tealLight text-lupetti-tealDark hover:bg-lupetti-teal hover:text-white transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={() => setIdx((prev) => (prev + 1) % slides.length)}
                  className="p-2.5 rounded-full bg-lupetti-tealLight text-lupetti-tealDark hover:bg-lupetti-teal hover:text-white transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

