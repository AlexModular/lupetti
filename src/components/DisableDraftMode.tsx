"use client";

import { useDraftModeEnvironment } from "next-sanity/hooks";

/** Bottone per uscire dall'anteprima, visibile solo fuori dallo Studio. */
export function DisableDraftMode() {
  const environment = useDraftModeEnvironment();

  // Dentro lo strumento "Anteprima" dello Studio non serve.
  if (environment !== "live" && environment !== "unknown") {
    return null;
  }

  return (
    <a
      href="/api/draft-mode/disable"
      className="fixed bottom-4 right-4 z-50 px-4 py-2 rounded-full bg-slate-900 text-white text-xs font-bold shadow-lg hover:bg-slate-700"
    >
      Esci dall&apos;anteprima
    </a>
  );
}
