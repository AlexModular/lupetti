"use client";

/**
 * Configurazione dello Studio Sanity, montato sulla rotta /studio
 * (src/app/studio/[[...tool]]/page.tsx).
 */

import { itITLocale } from "@sanity/locale-it-it";
import { visionTool } from "@sanity/vision";
import { defineConfig } from "sanity";
import { presentationTool } from "sanity/presentation";
import { structureTool } from "sanity/structure";

import { apiVersion, dataset, projectId, studioUrl } from "./src/sanity/env";
import { resolve } from "./src/sanity/presentation/resolve";
import { schema, SINGLETON } from "./src/sanity/schemaTypes";
import { structure } from "./src/sanity/structure";

/**
 * Tipi che non si possono creare dallo Studio:
 * - i documenti unici (ne esiste già uno)
 * - le prenotazioni: nascono solo dal sito, con un ID privato. Create da qui
 *   avrebbero un ID pubblico e i dati dei genitori sarebbero leggibili da fuori.
 */
const NON_CREABILI = new Set([...SINGLETON, "prenotazione"]);

export default defineConfig({
  name: "default",
  title: "I Lupetti",
  basePath: studioUrl,
  projectId,
  dataset,
  schema: {
    ...schema,
    templates: (templates) =>
      templates.filter(({ schemaType }) => !NON_CREABILI.has(schemaType)),
  },
  document: {
    newDocumentOptions: (prev) =>
      prev.filter(({ templateId }) => !NON_CREABILI.has(templateId)),
    actions: (prev, { schemaType }) => {
      if (SINGLETON.has(schemaType)) {
        // Niente "elimina" e "duplica" sui documenti unici.
        return prev.filter(
          ({ action }) =>
            !action || !["delete", "duplicate", "unpublish"].includes(action)
        );
      }
      if (schemaType === "prenotazione") {
        // Un duplicato avrebbe un ID pubblico: vedi NON_CREABILI.
        return prev.filter(({ action }) => action !== "duplicate");
      }
      return prev;
    },
  },
  plugins: [
    structureTool({ structure, title: "Contenuti" }),
    presentationTool({
      title: "Anteprima",
      resolve,
      previewUrl: {
        previewMode: { enable: "/api/draft-mode/enable" },
      },
    }),
    // Vision: per interrogare i dati con GROQ direttamente dallo Studio.
    visionTool({ defaultApiVersion: apiVersion }),
    itITLocale(),
  ],
});
