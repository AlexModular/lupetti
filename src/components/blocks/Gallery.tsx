"use client";

import { stegaClean } from "@sanity/client/stega";
import { ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import SanityImage from "@/components/SanityImage";
import SectionHeader from "@/components/SectionHeader";
import type { GalleryBlock, SliderBlock } from "@/types";

/* ------------------------------ Galleria con filtri ----------------------------- */

export function Gallery({ item }: { item: GalleryBlock }) {
  const foto = item.foto ?? [];
  const [categoria, setCategoria] = useState("Tutti");
  const [aperta, setAperta] = useState<number | null>(null);

  const categorie = [
    "Tutti",
    ...new Set(
      foto.map((f) => stegaClean(f.categoria)).filter((c): c is string => !!c)
    ),
  ];
  const visibili =
    categoria === "Tutti"
      ? foto
      : foto.filter((f) => stegaClean(f.categoria) === categoria);

  const chiudi = useCallback(() => setAperta(null), []);
  const sposta = useCallback(
    (delta: number) =>
      setAperta((i) =>
        i === null ? i : (i + delta + visibili.length) % visibili.length
      ),
    [visibili.length]
  );

  // Con la foto ingrandita: Esc chiude, le frecce scorrono.
  useEffect(() => {
    if (aperta === null) return;
    const suTasto = (e: KeyboardEvent) => {
      if (e.key === "Escape") chiudi();
      if (e.key === "ArrowRight") sposta(1);
      if (e.key === "ArrowLeft") sposta(-1);
    };
    document.addEventListener("keydown", suTasto);
    return () => document.removeEventListener("keydown", suTasto);
  }, [aperta, chiudi, sposta]);

  if (foto.length === 0) return null;
  const scelta = aperta === null ? null : visibili[aperta];

  return (
    <section className="py-14 sm:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          tagline={item.tagline}
          heading={item.heading}
        />

        {categorie.length > 2 && (
          <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
            {categorie.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => {
                  setCategoria(c);
                  setAperta(null);
                }}
                aria-pressed={categoria === c}
                className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${
                  categoria === c
                    ? "bg-lupetti-tealDark text-white shadow-sm"
                    : "bg-white text-slate-700 border border-slate-200 hover:border-lupetti-teal/60"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        )}

        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {visibili.map((f, i) => (
            <li key={f._id}>
              <button
                type="button"
                onClick={() => setAperta(i)}
                className="group w-full text-left bg-white rounded-md overflow-hidden border border-lupetti-teal/15 shadow-card hover:shadow-soft transition-shadow flex flex-col h-full"
              >
                <div className="relative aspect-[10/7] overflow-hidden bg-slate-50 w-full">
                  <SanityImage
                    image={f.immagine}
                    alt={f.title || ""}
                    width={640}
                    aspect={10 / 7}
                    sizes="(min-width: 1024px) 370px, (min-width: 640px) 50vw, 100vw"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute top-3 right-3 p-2 rounded-full bg-white/90 text-slate-700 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity">
                    <ZoomIn className="w-4 h-4" aria-hidden />
                  </span>
                </div>
                <div className="p-5">
                  {f.categoria && (
                    <span className="text-xs font-extrabold uppercase tracking-wider text-lupetti-tealDark">
                      {f.categoria}
                    </span>
                  )}
                  <h3 className="font-display text-lg font-bold text-slate-800 mt-0.5">
                    {f.title}
                  </h3>
                  {f.didascalia && (
                    <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                      {f.didascalia}
                    </p>
                  )}
                </div>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {scelta && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={chiudi}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={scelta.title || "Foto"}
            className="bg-white rounded-md max-w-3xl w-full overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative bg-slate-50">
              <SanityImage
                image={scelta.immagine}
                alt={scelta.title || ""}
                width={1400}
                sizes="(min-width: 800px) 768px, 100vw"
                className="w-full max-h-[65vh] object-contain mx-auto"
              />
              <button
                type="button"
                onClick={chiudi}
                aria-label="Chiudi"
                className="absolute top-4 right-4 p-2 rounded-full bg-white/90 text-slate-800 shadow"
              >
                <X className="w-5 h-5" aria-hidden />
              </button>
              {visibili.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => sposta(-1)}
                    aria-label="Foto precedente"
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 text-slate-800 shadow"
                  >
                    <ChevronLeft className="w-5 h-5" aria-hidden />
                  </button>
                  <button
                    type="button"
                    onClick={() => sposta(1)}
                    aria-label="Foto successiva"
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 text-slate-800 shadow"
                  >
                    <ChevronRight className="w-5 h-5" aria-hidden />
                  </button>
                </>
              )}
            </div>
            <div className="p-6">
              <h3 className="font-display text-xl font-bold text-slate-800">
                {scelta.title}
              </h3>
              {scelta.didascalia && (
                <p className="text-sm text-slate-600 mt-1">{scelta.didascalia}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

/* --------------------------------- Carosello --------------------------------- */

export function Slider({ item }: { item: SliderBlock }) {
  const slides = (item.slides ?? []).filter((s) => s.image?.asset?._ref);
  const [indice, setIndice] = useState(0);

  if (slides.length === 0) return null;
  const attuale = slides[Math.min(indice, slides.length - 1)];
  const vai = (delta: number) =>
    setIndice((i) => (i + delta + slides.length) % slides.length);

  return (
    <section className="py-14 bg-lupetti-tealLight/30">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {item.heading && (
          <h2 className="titolo-sezione mb-10 text-center">
            {item.heading}
          </h2>
        )}

        <div className="bg-white rounded-md overflow-hidden border border-lupetti-teal/20 shadow-card">
          <div className="aspect-[16/9] bg-slate-50">
            <SanityImage
              key={attuale._key}
              image={attuale.image}
              alt={attuale.title || ""}
              width={1280}
              aspect={16 / 9}
              sizes="(min-width: 1024px) 960px, 100vw"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="p-6 flex items-center justify-between gap-4">
            <div aria-live="polite">
              {attuale.title && (
                <h3 className="font-display text-xl font-bold text-slate-800">
                  {attuale.title}
                </h3>
              )}
              {attuale.caption && (
                <p className="text-sm text-slate-600 mt-1">{attuale.caption}</p>
              )}
            </div>

            {slides.length > 1 && (
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => vai(-1)}
                  aria-label="Immagine precedente"
                  className="p-2.5 rounded-full bg-lupetti-tealLight text-lupetti-tealDark hover:bg-lupetti-tealDark hover:text-white transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" aria-hidden />
                </button>
                <span className="text-xs font-bold text-slate-500 tabular-nums">
                  {Math.min(indice, slides.length - 1) + 1}/{slides.length}
                </span>
                <button
                  type="button"
                  onClick={() => vai(1)}
                  aria-label="Immagine successiva"
                  className="p-2.5 rounded-full bg-lupetti-tealLight text-lupetti-tealDark hover:bg-lupetti-tealDark hover:text-white transition-colors"
                >
                  <ChevronRight className="w-5 h-5" aria-hidden />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
