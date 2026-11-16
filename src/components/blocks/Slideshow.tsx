"use client";

import { A11y, Autoplay, EffectFade, Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import SanityImage from "@/components/SanityImage";
import SmartLink from "@/components/SmartLink";
import type { SlideshowBlock } from "@/types";

import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/navigation";
import "swiper/css/pagination";

/**
 * Slideshow a tutta larghezza (Swiper), come quello in cima al sito di Da
 * Lucia: foto grandi che scorrono da sole, con titolo, sottotitolo e bottone
 * sopra ogni foto. Senza foto il blocco non compare.
 */
export default function Slideshow({ item }: { item: SlideshowBlock }) {
  const slide = (item.images ?? []).filter((s) => s.asset?._ref);
  if (slide.length === 0) return null;

  return (
    <section className="slideshow" aria-roledescription="carousel">
      <Swiper
        modules={[A11y, Autoplay, EffectFade, Navigation, Pagination]}
        slidesPerView={1}
        loop={slide.length > 1}
        effect="fade"
        fadeEffect={{ crossFade: true }}
        autoplay={
          slide.length > 1
            ? { delay: 5000, pauseOnMouseEnter: true, disableOnInteraction: false }
            : false
        }
        navigation={slide.length > 1}
        pagination={slide.length > 1 ? { clickable: true } : false}
        a11y={{
          prevSlideMessage: "Foto precedente",
          nextSlideMessage: "Foto successiva",
          paginationBulletMessage: "Vai alla foto {{index}}",
        }}
      >
        {slide.map((s, i) => (
          <SwiperSlide key={s._key}>
            <div className="relative h-[52vh] min-h-[320px] max-h-[720px] bg-slate-800">
              <SanityImage
                image={s}
                alt={s.alt || s.heading || ""}
                width={1920}
                aspect={16 / 7}
                priority={i === 0}
                className="absolute inset-0 w-full h-full object-cover"
              />
              {(s.heading || s.subtitle || s.cta?.label) && (
                <div className="absolute inset-0 bg-black/35 flex flex-col items-center justify-center text-center px-12 sm:px-20 gap-3 sm:gap-5">
                  {s.heading && (
                    <p className="font-display font-semibold uppercase tracking-wide text-white text-3xl sm:text-5xl lg:text-7xl text-balance [text-shadow:0_0_20px_rgb(0_0_0_/_0.7)]">
                      {s.heading}
                    </p>
                  )}
                  {s.subtitle && (
                    <p className="font-display text-white text-lg sm:text-2xl lg:text-3xl max-w-3xl [text-shadow:0_0_10px_rgb(0_0_0_/_0.8)]">
                      {s.subtitle}
                    </p>
                  )}
                  {s.cta?.label && (
                    <SmartLink href={s.cta.href} className="btn-pieno mt-2">
                      {s.cta.label}
                    </SmartLink>
                  )}
                </div>
              )}
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}
