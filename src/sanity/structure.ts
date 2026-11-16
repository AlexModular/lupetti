import {
  CalendarIcon,
  CheckmarkCircleIcon,
  ClockIcon,
  CogIcon,
  DocumentsIcon,
  HeartIcon,
  ImagesIcon,
  MenuIcon,
  StarIcon,
  UsersIcon,
} from "@sanity/icons";
import type { StructureBuilder, StructureResolver } from "sanity/structure";

import { apiVersion } from "./env";

/** Data di oggi a Bologna, nel formato usato dalle prenotazioni (AAAA-MM-GG). */
const oggiRoma = () =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Rome" }).format(
    new Date()
  );

type Ordine = { field: string; direction: "asc" | "desc" }[];

const ORDINE_CRONOLOGICO: Ordine = [
  { field: "data", direction: "asc" },
  { field: "oraInizio", direction: "asc" },
];

const singleton = (
  S: StructureBuilder,
  type: string,
  title: string,
  icon: typeof CogIcon
) =>
  S.listItem()
    .title(title)
    .id(type)
    .icon(icon)
    .child(S.document().schemaType(type).documentId(type).title(title));

/** Elenco di prenotazioni filtrato. Dallo Studio non se ne possono creare. */
const elencoPrenotazioni = (
  S: StructureBuilder,
  title: string,
  filtro: string,
  params: Record<string, string> = {},
  ordine: Ordine = ORDINE_CRONOLOGICO
) =>
  S.documentList()
    .title(title)
    .schemaType("prenotazione")
    .apiVersion(apiVersion)
    .filter(`_type == "prenotazione" && ${filtro}`)
    .params(params)
    .defaultOrdering(ordine)
    .initialValueTemplates([]);

// https://www.sanity.io/docs/structure-builder-cheat-sheet
export const structure: StructureResolver = (S) => {
  const oggi = oggiRoma();

  return S.list()
    .title("I Lupetti")
    .items([
      S.listItem()
        .title("Prenotazioni")
        .icon(UsersIcon)
        .child(
          S.list()
            .title("Prenotazioni")
            .items([
              S.listItem()
                .title("Oggi")
                .icon(ClockIcon)
                .child(
                  elencoPrenotazioni(
                    S,
                    "Prenotazioni di oggi",
                    'data == $oggi && stato != "annullata"',
                    { oggi }
                  )
                ),
              S.listItem()
                .title("Prossime")
                .icon(CalendarIcon)
                .child(
                  elencoPrenotazioni(
                    S,
                    "Prossime prenotazioni",
                    'data >= $oggi && stato != "annullata"',
                    { oggi }
                  )
                ),
              S.listItem()
                .title("In attesa di conferma")
                .icon(ClockIcon)
                .child(
                  elencoPrenotazioni(
                    S,
                    "In attesa di conferma",
                    'stato == "in_attesa" && data >= $oggi',
                    { oggi }
                  )
                ),
              S.divider(),
              S.listItem()
                .title("Ludoteca a ore")
                .icon(ClockIcon)
                .child(
                  elencoPrenotazioni(
                    S,
                    "Ludoteca a ore (da oggi)",
                    'tipo == "ludoteca" && data >= $oggi',
                    { oggi }
                  )
                ),
              S.listItem()
                .title("Per laboratorio / evento")
                .icon(CalendarIcon)
                .child(
                  S.documentTypeList("evento")
                    .title("Scegli il laboratorio")
                    .defaultOrdering([{ field: "inizio", direction: "desc" }])
                    .initialValueTemplates([])
                    .child((eventoId) =>
                      elencoPrenotazioni(
                        S,
                        "Iscritti",
                        "evento._ref == $eventoId",
                        { eventoId: eventoId.replace(/^drafts\./, "") },
                        [{ field: "creataIl", direction: "asc" }]
                      )
                    )
                ),
              S.divider(),
              S.listItem()
                .title("Annullate")
                .child(
                  elencoPrenotazioni(
                    S,
                    "Prenotazioni annullate",
                    'stato == "annullata"',
                    {},
                    [{ field: "data", direction: "desc" }]
                  )
                ),
              S.listItem()
                .title("Passate")
                .child(
                  elencoPrenotazioni(
                    S,
                    "Prenotazioni passate",
                    "data < $oggi",
                    { oggi },
                    [
                      { field: "data", direction: "desc" },
                      { field: "oraInizio", direction: "asc" },
                    ]
                  )
                ),
              S.listItem()
                .title("Tutte")
                .icon(CheckmarkCircleIcon)
                .child(
                  elencoPrenotazioni(S, "Tutte le prenotazioni", "true", {}, [
                    { field: "creataIl", direction: "desc" },
                  ])
                ),
            ])
        ),
      S.documentTypeListItem("evento")
        .title("Laboratori ed eventi")
        .icon(CalendarIcon),
      S.divider(),
      S.documentTypeListItem("page").title("Pagine").icon(DocumentsIcon),
      singleton(S, "navigation", "Menu di navigazione", MenuIcon),
      S.divider(),
      S.documentTypeListItem("servizio").title("Servizi").icon(HeartIcon),
      S.documentTypeListItem("foto").title("Galleria foto").icon(ImagesIcon),
      S.documentTypeListItem("pacchettoFesta")
        .title("Pacchetti feste")
        .icon(StarIcon),
      S.divider(),
      singleton(S, "impostazioni", "Impostazioni generali", CogIcon),
      singleton(
        S,
        "impostazioniPrenotazioni",
        "Impostazioni prenotazioni",
        CogIcon
      ),
    ]);
};
