import type { SchemaTypeDefinition } from "sanity";

import { blocchiTypes } from "./blocchiTypes";
import { blockContentType } from "./blockContentType";
import { fotoType, pacchettoFestaType, servizioType } from "./catalogoTypes";
import { eventoType } from "./eventoType";
import { impostazioniPrenotazioniType } from "./impostazioniPrenotazioniType";
import { impostazioniType } from "./impostazioniType";
import { linkType } from "./linkType";
import { navigationType } from "./navigationType";
import { fasciaOrariaType, orariSettimanaliType } from "./orariType";
import { pageType } from "./pageType";
import { prenotazioneType } from "./prenotazioneType";

/** Documenti unici: ne esiste uno solo, con ID uguale al nome del tipo. */
export const SINGLETON = new Set([
  "navigation",
  "impostazioni",
  "impostazioniPrenotazioni",
]);

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    // Documenti
    pageType,
    navigationType,
    eventoType,
    prenotazioneType,
    servizioType,
    fotoType,
    pacchettoFestaType,
    impostazioniType,
    impostazioniPrenotazioniType,
    // Oggetti riutilizzabili
    linkType,
    blockContentType,
    fasciaOrariaType,
    orariSettimanaliType,
    // Blocchi del page builder
    ...blocchiTypes,
  ],
};
