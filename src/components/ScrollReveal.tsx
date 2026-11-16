"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Fa comparire con una dissolvenza gli elementi marcati con `data-reveal`
 * quando entrano nello schermo (come le animazioni del sito di Da Lucia).
 * Lo stile sta in globals.css. Non disegna nulla: va messo una volta nel layout.
 */
export default function ScrollReveal() {
  const pathname = usePathname();

  useEffect(() => {
    const radice = document.documentElement;
    const osservatore = new IntersectionObserver(
      (voci) => {
        for (const voce of voci) {
          if (voce.isIntersecting) {
            voce.target.classList.add("visibile");
            osservatore.unobserve(voce.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px" }
    );

    const registra = () => {
      for (const el of document.querySelectorAll("[data-reveal]:not(.visibile)")) {
        // Ciò che è già nello schermo resta visibile subito, senza sfarfallio.
        if (
          !radice.classList.contains("con-comparsa") &&
          el.getBoundingClientRect().top < window.innerHeight
        ) {
          el.classList.add("visibile");
        } else {
          osservatore.observe(el);
        }
      }
    };

    registra();
    radice.classList.add("con-comparsa");

    // I contenuti possono cambiare dal vivo (anteprima, aggiornamenti).
    const mutazioni = new MutationObserver(registra);
    mutazioni.observe(document.body, { childList: true, subtree: true });

    return () => {
      osservatore.disconnect();
      mutazioni.disconnect();
    };
  }, [pathname]);

  return null;
}
