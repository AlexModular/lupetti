import "server-only";

import { randomInt, randomUUID } from "node:crypto";

import { serverClient } from "@/sanity/lib/serverClient";
import type {
  DisponibilitaEvento,
  DisponibilitaLudoteca,
  EsitoPrenotazione,
  RegolePrenotazioni,
  SlotDisponibilita,
  StatoSlot,
} from "@/types";

import {
  aggiungiGiorni,
  daMinuti,
  fascePerData,
  formattaData,
  formattaEvento,
  inMinuti,
  isData,
  isOrario,
  minutiDaAdesso,
  oraRoma,
  slotDaFasce,
  SLOT_MINUTI,
  type OrariSettimanali,
} from "./orari";

/**
 * Prenotazioni: disponibilità e salvataggio.
 *
 * Dove stanno i dati
 * ------------------
 * Ogni prenotazione è un documento Sanity con ID "prenotazione.<uuid>". Il
 * punto nell'ID lo rende privato: si legge solo con il token del server, anche
 * se il dataset è pubblico. Al browser arrivano solo i conteggi dei posti.
 *
 * Come si evita l'overbooking
 * ---------------------------
 * I posti liberi si calcolano sempre sommando le prenotazioni esistenti: non
 * c'è un contatore separato che possa andare fuori sincrono (se dallo Studio
 * si annulla una prenotazione, i posti tornano liberi da soli).
 * Per impedire che due genitori prendano insieme l'ultimo posto si usa un
 * documento "lucchetto": ogni salvataggio legge la sua revisione insieme ai
 * posti occupati e scrive solo se la revisione è ancora quella. Se nel
 * frattempo qualcun altro ha prenotato, Sanity rifiuta la scrittura (409) e si
 * riparte rileggendo i posti aggiornati.
 *
 * In più, dentro lo stesso server le prenotazioni vengono salvate una alla
 * volta (vedi "inFila"): se arrivano dieci richieste nello stesso secondo non
 * si ostacolano a vicenda e non si supera il limite di scritture al secondo
 * di Sanity. Il lucchetto resta la garanzia quando i server sono più di uno.
 */

const LOCK_ID = "sistema.lock-prenotazioni";
const MAX_TENTATIVI = 8;
/** Oltre questo numero di richieste in attesa si chiede di riprovare. */
const MAX_IN_FILA = 25;

/** Errore da mostrare al genitore, con lo stato HTTP da restituire. */
export class ErrorePrenotazione extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.name = "ErrorePrenotazione";
    this.status = status;
  }
}

/* ---------------------------------- Regole ---------------------------------- */

const intero = (v: unknown, predefinito: number, min: number) =>
  typeof v === "number" && Number.isFinite(v)
    ? Math.max(min, Math.floor(v))
    : predefinito;

function leggiRegole(r: RegolePrenotazioni | null | undefined) {
  return {
    ludotecaAttiva: r?.ludotecaAttiva !== false,
    capienzaOraria: intero(r?.capienzaOraria, 12, 0),
    maxOre: intero(r?.maxOrePerPrenotazione, 3, 1),
    maxBambini: intero(r?.maxBambiniPerPrenotazione, 4, 1),
    anticipoGiorni: intero(r?.anticipoMassimoGiorni, 30, 1),
    preavvisoMinuti:
      typeof r?.preavvisoMinimoOre === "number" && r.preavvisoMinimoOre >= 0
        ? Math.round(r.preavvisoMinimoOre * 60)
        : 120,
    confermaAutomatica: r?.confermaAutomatica !== false,
    eccezioni: r?.eccezioni ?? [],
  };
}

/* ------------------------------ Ludoteca a ore ------------------------------ */

interface EventoInSala {
  title?: string | null;
  inizio: string;
  fine: string;
  /** Se manca vale "chiusa": durante un evento la ludoteca non è prenotabile. */
  ludotecaDuranteEvento?: "chiusa" | "ridotta" | null;
  riduzioneCapienza?: number | null;
}

interface ContestoGiorno {
  regole: RegolePrenotazioni | null;
  orari: OrariSettimanali | null;
  eventi: EventoInSala[] | null;
  prenotazioni: { slots?: string[] | null; bambini?: number | null }[] | null;
}

const REGOLE = `*[_id == "impostazioniPrenotazioni"][0]{
  ludotecaAttiva, capienzaOraria, maxOrePerPrenotazione,
  maxBambiniPerPrenotazione, anticipoMassimoGiorni, preavvisoMinimoOre,
  confermaAutomatica, eccezioni[]{ data, chiuso, capienza, nota }
}`;

const NEGOZIO = `{
  "negozio": *[_id == "impostazioni"][0]{ nomeAttivita, email, telefono },
  "emailNotifiche": *[_id == "impostazioniPrenotazioni"][0].emailNotifiche
}`;

const GIORNO_QUERY = `{
  "lock": *[_id == $lockId][0]._rev,
  "regole": ${REGOLE},
  "orari": *[_id == "impostazioni"][0].orari,
  "eventi": *[
    _type == "evento"
    && ludotecaDuranteEvento != "aperta"
    && inizio < $finoA && fine > $da
  ]{ title, inizio, fine, ludotecaDuranteEvento, riduzioneCapienza },
  "prenotazioni": *[
    _type == "prenotazione" && tipo == "ludoteca"
    && data == $data && stato != "annullata"
  ]{ slots, bambini },
  "contatti": ${NEGOZIO}
}`;

type FotoGiorno = ContestoGiorno & {
  lock: string | null;
  contatti: Contatti | null;
};

const leggiGiorno = (data: string) =>
  serverClient.fetch<FotoGiorno>(GIORNO_QUERY, {
    lockId: LOCK_ID,
    data,
    // Margine di un giorno: gli orari degli eventi sono salvati in UTC.
    da: `${aggiungiGiorni(data, -1)}T00:00:00Z`,
    finoA: `${aggiungiGiorni(data, 2)}T00:00:00Z`,
  });

/** Calcola le fasce di un giorno e i posti rimasti in ognuna. */
export function calcolaGiornoLudoteca(
  data: string,
  ctx: ContestoGiorno,
  adesso: Date = new Date()
): DisponibilitaLudoteca {
  const regole = leggiRegole(ctx.regole);
  const chiuso = (motivo: string): DisponibilitaLudoteca => ({
    data,
    aperta: false,
    motivo,
    slots: [],
  });

  if (!regole.ludotecaAttiva) {
    return chiuso(
      "Le prenotazioni online della ludoteca sono momentaneamente sospese."
    );
  }

  const oggi = oraRoma(adesso).data;
  if (data < oggi) return chiuso("Questo giorno è già passato.");
  if (data > aggiungiGiorni(oggi, regole.anticipoGiorni)) {
    return chiuso(
      `Si può prenotare al massimo con ${regole.anticipoGiorni} giorni di anticipo.`
    );
  }

  const eccezione = regole.eccezioni.find((e) => e.data === data);
  if (eccezione?.chiuso) {
    return chiuso(eccezione.nota || "In questo giorno la ludoteca è chiusa.");
  }

  const turni = slotDaFasce(fascePerData(ctx.orari, data));
  if (turni.length === 0) return chiuso("In questo giorno siamo chiusi.");

  const capienzaGiorno =
    typeof eccezione?.capienza === "number"
      ? Math.max(0, Math.floor(eccezione.capienza))
      : regole.capienzaOraria;

  // Bambini già prenotati in ogni fascia.
  const occupati = new Map<string, number>();
  for (const p of ctx.prenotazioni ?? []) {
    for (const ora of p.slots ?? []) {
      occupati.set(ora, (occupati.get(ora) ?? 0) + (p.bambini ?? 0));
    }
  }

  // Eventi che occupano la sala, come intervalli in minuti dentro questo giorno.
  const eventi = (ctx.eventi ?? []).flatMap((e) => {
    const da = oraRoma(e.inizio);
    const a = oraRoma(e.fine);
    if (da.data > data || a.data < data) return [];
    return [
      {
        titolo: e.title || "evento",
        inizio: da.data === data ? da.minuti : 0,
        fine: a.data === data ? a.minuti : 1440,
        chiude: e.ludotecaDuranteEvento !== "ridotta",
        riduzione: Math.max(0, e.riduzioneCapienza ?? 0),
      },
    ];
  });

  const slots: SlotDisponibilita[] = turni.map((turno) => {
    const inizio = inMinuti(turno.ora);
    const fine = inizio + SLOT_MINUTI;
    let capienza = capienzaGiorno;
    let salaRiservata: string | null = null;

    for (const evento of eventi) {
      if (inizio < evento.fine && fine > evento.inizio) {
        if (evento.chiude) {
          capienza = 0;
          salaRiservata = evento.titolo;
        } else {
          capienza = Math.max(0, capienza - evento.riduzione);
        }
      }
    }

    const rimasti = Math.max(0, capienza - (occupati.get(turno.ora) ?? 0));
    let stato: StatoSlot = "disponibile";
    let nota: string | undefined;

    if (minutiDaAdesso(data, turno.ora, adesso) < regole.preavvisoMinuti) {
      stato = "non_prenotabile";
      nota = "Non più prenotabile online";
    } else if (salaRiservata) {
      stato = "chiuso";
      nota = `Sala riservata: ${salaRiservata}`;
    } else if (rimasti === 0) {
      stato = "pieno";
      nota = "Al completo";
    }

    return {
      ora: turno.ora,
      fine: turno.fine,
      capienza,
      rimasti: stato === "disponibile" ? rimasti : 0,
      stato,
      nota,
    };
  });

  return { data, aperta: true, slots };
}

export async function disponibilitaLudoteca(
  data: string
): Promise<DisponibilitaLudoteca> {
  return calcolaGiornoLudoteca(data, await leggiGiorno(data));
}

/* ---------------------------- Laboratori ed eventi --------------------------- */

interface EventoPrenotabile {
  _id: string;
  title?: string | null;
  inizio?: string | null;
  fine?: string | null;
  prenotabile?: boolean | null;
  capienza?: number | null;
}

const capienzaEvento = (e: { capienza?: number | null }) =>
  intero(e.capienza, 10, 0);

const eventoAperto = (
  e: { prenotabile?: boolean | null; inizio?: string | null },
  adesso = Date.now()
) =>
  e.prenotabile !== false &&
  Boolean(e.inizio) &&
  new Date(e.inizio as string).getTime() > adesso;

const PRENOTATI_EVENTO = (idEvento: string) => `math::sum(*[
  _type == "prenotazione" && tipo == "evento"
  && evento._ref == ${idEvento} && stato != "annullata"
].bambini)`;

export async function disponibilitaEventi(): Promise<DisponibilitaEvento[]> {
  const eventi = await serverClient.fetch<
    (EventoPrenotabile & { prenotati: number | null })[]
  >(
    `*[_type == "evento" && fine > now()]{
      _id, inizio, prenotabile, capienza,
      "prenotati": ${PRENOTATI_EVENTO("^._id")}
    }`
  );

  return eventi.map((e) => {
    const capienza = capienzaEvento(e);
    const prenotati = e.prenotati ?? 0;
    return {
      id: e._id,
      capienza,
      prenotati,
      rimasti: Math.max(0, capienza - prenotati),
      aperto: eventoAperto(e),
    };
  });
}

const EVENTO_QUERY = `{
  "lock": *[_id == $lockId][0]._rev,
  "regole": ${REGOLE},
  "evento": *[_type == "evento" && _id == $eventoId][0]{
    _id, title, inizio, fine, prenotabile, capienza
  },
  "prenotati": ${PRENOTATI_EVENTO("$eventoId")},
  "contatti": ${NEGOZIO}
}`;

interface FotoEvento {
  lock: string | null;
  regole: RegolePrenotazioni | null;
  evento: EventoPrenotabile | null;
  prenotati: number | null;
  contatti: Contatti | null;
}

/* ------------------------------ Dati dal modulo ------------------------------ */

export interface DatiFamiglia {
  genitoreNome: string;
  telefono: string;
  email: string;
  bambinoNome: string;
  bambinoEta: string;
  note: string;
  bambini: number;
}

export type RichiestaPrenotazione = DatiFamiglia &
  (
    | { tipo: "evento"; eventoId: string }
    | { tipo: "ludoteca"; data: string; slots: string[] }
  );

const testo = (v: unknown, max: number) =>
  typeof v === "string" ? v.replace(/\s+/g, " ").trim().slice(0, max) : "";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const TELEFONO = /^\+?[\d\s./()-]{6,20}$/;
// Gli ID dei documenti pubblici non contengono punti: così non si può
// puntare a una bozza o a un documento privato.
const ID_PUBBLICO = /^[a-zA-Z0-9_-]{1,128}$/;

/** Controlla e ripulisce i dati arrivati dal modulo. */
export function leggiRichiesta(body: unknown): RichiestaPrenotazione {
  if (!body || typeof body !== "object") {
    throw new ErrorePrenotazione("Richiesta non valida.");
  }
  const b = body as Record<string, unknown>;

  const famiglia: DatiFamiglia = {
    genitoreNome: testo(b.genitoreNome, 80),
    telefono: testo(b.telefono, 24),
    email: testo(b.email, 120).toLowerCase(),
    bambinoNome: testo(b.bambinoNome, 120),
    bambinoEta: testo(b.bambinoEta, 40),
    note: testo(b.note, 500),
    bambini: Number(b.bambini),
  };

  if (famiglia.genitoreNome.length < 2) {
    throw new ErrorePrenotazione("Inserisci nome e cognome del genitore.");
  }
  if (!TELEFONO.test(famiglia.telefono)) {
    throw new ErrorePrenotazione("Inserisci un numero di telefono valido.");
  }
  if (!EMAIL.test(famiglia.email)) {
    throw new ErrorePrenotazione("Inserisci un indirizzo email valido.");
  }
  if (!famiglia.bambinoNome) {
    throw new ErrorePrenotazione("Inserisci il nome del bambino o della bambina.");
  }
  if (!famiglia.bambinoEta) {
    throw new ErrorePrenotazione("Inserisci l'età del bambino o della bambina.");
  }
  if (!Number.isInteger(famiglia.bambini) || famiglia.bambini < 1) {
    throw new ErrorePrenotazione("Indica per quanti bambini vuoi prenotare.");
  }
  if (b.consensoPrivacy !== true) {
    throw new ErrorePrenotazione(
      "Per prenotare serve il consenso al trattamento dei dati."
    );
  }

  if (b.tipo === "evento") {
    if (typeof b.eventoId !== "string" || !ID_PUBBLICO.test(b.eventoId)) {
      throw new ErrorePrenotazione("Evento non valido.");
    }
    return { ...famiglia, tipo: "evento", eventoId: b.eventoId };
  }

  if (b.tipo === "ludoteca") {
    if (!isData(b.data)) throw new ErrorePrenotazione("Giorno non valido.");
    if (
      !Array.isArray(b.slots) ||
      b.slots.length === 0 ||
      b.slots.length > 24 ||
      !b.slots.every(isOrario)
    ) {
      throw new ErrorePrenotazione("Scegli almeno una fascia oraria.");
    }
    const slots = [...new Set(b.slots as string[])].sort();
    return { ...famiglia, tipo: "ludoteca", data: b.data, slots };
  }

  throw new ErrorePrenotazione("Tipo di prenotazione non valido.");
}

/* --------------------------------- Salvataggio -------------------------------- */

interface Contatti {
  negozio: {
    nomeAttivita?: string | null;
    email?: string | null;
    telefono?: string | null;
  } | null;
  emailNotifiche?: string | null;
}

export interface PrenotazioneSalvata {
  esito: EsitoPrenotazione;
  famiglia: DatiFamiglia;
  contatti: Contatti | null;
}

// Senza lettere e cifre che si confondono a voce (O/0, I/1…).
const ALFABETO = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const nuovoCodice = () =>
  `LUP-${Array.from({ length: 6 }, () => ALFABETO[randomInt(ALFABETO.length)]).join("")}`;

const plurale = (n: number) => (n === 1 ? "posto" : "posti");

function controllaBambini(bambini: number, max: number) {
  if (bambini > max) {
    throw new ErrorePrenotazione(
      `Online si possono prenotare al massimo ${max} bambini per volta. Per gruppi più numerosi contattaci.`
    );
  }
}

interface PrenotazionePronta {
  confermaAutomatica: boolean;
  /** Campi specifici del tipo di prenotazione (giorno, ore, evento…). */
  campi: Record<string, unknown>;
  cosa: string;
  quando: string;
}

/** Prepara il documento da salvare per la ludoteca, o lancia un errore. */
function preparaLudoteca(
  r: Extract<RichiestaPrenotazione, { tipo: "ludoteca" }>,
  foto: FotoGiorno
): PrenotazionePronta {
  const regole = leggiRegole(foto.regole);
  const giorno = calcolaGiornoLudoteca(r.data, foto);
  if (!giorno.aperta) {
    throw new ErrorePrenotazione(
      giorno.motivo || "Giorno non prenotabile.",
      409
    );
  }

  controllaBambini(r.bambini, regole.maxBambini);
  if (r.slots.length > regole.maxOre) {
    throw new ErrorePrenotazione(
      `Si possono prenotare al massimo ${regole.maxOre} ore di fila.`
    );
  }

  const scelti = r.slots.map((ora) => giorno.slots.find((s) => s.ora === ora));
  for (const [i, slot] of scelti.entries()) {
    if (!slot) {
      throw new ErrorePrenotazione(
        `La fascia delle ${r.slots[i]} non esiste in questo giorno.`,
        409
      );
    }
    if (i > 0 && scelti[i - 1]?.fine !== slot.ora) {
      throw new ErrorePrenotazione("Le ore scelte devono essere consecutive.");
    }
    if (slot.stato !== "disponibile") {
      throw new ErrorePrenotazione(
        `La fascia delle ${slot.ora} non è più prenotabile${
          slot.nota ? ` (${slot.nota.toLowerCase()})` : ""
        }.`,
        409
      );
    }
    if (slot.rimasti < r.bambini) {
      throw new ErrorePrenotazione(
        `Alle ${slot.ora} ${slot.rimasti === 1 ? "resta" : "restano"} solo ${
          slot.rimasti
        } ${plurale(slot.rimasti)}.`,
        409
      );
    }
  }

  const oraInizio = r.slots[0];
  const oraFine = daMinuti(inMinuti(r.slots[r.slots.length - 1]) + SLOT_MINUTI);
  const giornoTesto = formattaData(r.data);

  return {
    confermaAutomatica: regole.confermaAutomatica,
    campi: { data: r.data, slots: r.slots, oraInizio, oraFine },
    cosa: "Ludoteca",
    quando: `${giornoTesto.charAt(0).toUpperCase()}${giornoTesto.slice(
      1
    )} · ${oraInizio} – ${oraFine}`,
  };
}

/** Prepara il documento da salvare per un evento, o lancia un errore. */
function preparaEvento(
  r: Extract<RichiestaPrenotazione, { tipo: "evento" }>,
  foto: FotoEvento
): PrenotazionePronta {
  const regole = leggiRegole(foto.regole);
  const evento = foto.evento;
  if (!evento) {
    throw new ErrorePrenotazione("Questo evento non è più in programma.", 404);
  }
  if (evento.prenotabile === false) {
    throw new ErrorePrenotazione(
      "Questo evento non accetta prenotazioni online."
    );
  }
  if (!eventoAperto(evento)) {
    throw new ErrorePrenotazione(
      "Le prenotazioni per questo evento sono chiuse.",
      409
    );
  }

  controllaBambini(r.bambini, regole.maxBambini);
  const rimasti = Math.max(0, capienzaEvento(evento) - (foto.prenotati ?? 0));
  if (rimasti === 0) {
    throw new ErrorePrenotazione("Posti esauriti per questo evento.", 409);
  }
  if (r.bambini > rimasti) {
    throw new ErrorePrenotazione(
      `${rimasti === 1 ? "Resta" : "Restano"} solo ${rimasti} ${plurale(rimasti)}.`,
      409
    );
  }

  const inizio = oraRoma(evento.inizio as string);
  return {
    confermaAutomatica: regole.confermaAutomatica,
    campi: {
      data: inizio.data,
      oraInizio: inizio.ora,
      ...(evento.fine ? { oraFine: oraRoma(evento.fine).ora } : {}),
      evento: { _type: "reference", _ref: evento._id, _weak: true },
      eventoTitolo: evento.title || "Evento",
    },
    cosa: evento.title || "Evento",
    quando: formattaEvento(evento.inizio, evento.fine),
  };
}

const pausa = (ms: number) => new Promise((ok) => setTimeout(ok, ms));

const statoHttp = (err: unknown) =>
  typeof err === "object" && err !== null
    ? (err as { statusCode?: number }).statusCode
    : undefined;

const TROPPE_RICHIESTE =
  "In questo momento ci sono molte richieste. Riprova tra qualche secondo.";

let fila: Promise<unknown> = Promise.resolve();
let inAttesa = 0;

/** Esegue i salvataggi uno dopo l'altro, nell'ordine in cui arrivano. */
function inFila<T>(lavoro: () => Promise<T>): Promise<T> {
  if (inAttesa >= MAX_IN_FILA) {
    return Promise.reject(new ErrorePrenotazione(TROPPE_RICHIESTE, 503));
  }
  inAttesa++;
  const risultato = fila.then(lavoro, lavoro).finally(() => {
    inAttesa--;
  });
  fila = risultato.catch(() => undefined);
  return risultato;
}

/**
 * Salva una prenotazione controllando i posti in modo atomico.
 * Lancia ErrorePrenotazione se i dati non vanno bene o i posti non bastano.
 */
export function creaPrenotazione(
  richiesta: RichiestaPrenotazione
): Promise<PrenotazioneSalvata> {
  return inFila(() => salvaPrenotazione(richiesta));
}

async function salvaPrenotazione(
  richiesta: RichiestaPrenotazione
): Promise<PrenotazioneSalvata> {
  for (let tentativo = 0; tentativo < MAX_TENTATIVI; tentativo++) {
    const foto =
      richiesta.tipo === "ludoteca"
        ? await leggiGiorno(richiesta.data)
        : await serverClient.fetch<FotoEvento>(EVENTO_QUERY, {
            lockId: LOCK_ID,
            eventoId: richiesta.eventoId,
          });

    if (!foto.lock) {
      // Prima prenotazione in assoluto: crea il lucchetto e riparti.
      await serverClient.createIfNotExists({
        _id: LOCK_ID,
        _type: "lockPrenotazioni",
        n: 0,
      });
      continue;
    }

    const pronta =
      richiesta.tipo === "ludoteca"
        ? preparaLudoteca(richiesta, foto as FotoGiorno)
        : preparaEvento(richiesta, foto as FotoEvento);

    const stato = pronta.confermaAutomatica ? "confermata" : "in_attesa";
    const codice = nuovoCodice();
    const { genitoreNome, telefono, email, bambinoNome, bambinoEta, note, bambini } =
      richiesta;

    try {
      await serverClient
        .transaction()
        .patch(LOCK_ID, (p) => p.ifRevisionId(foto.lock as string).inc({ n: 1 }))
        .create({
          _id: `prenotazione.${randomUUID()}`,
          _type: "prenotazione",
          tipo: richiesta.tipo,
          stato,
          codice,
          ...pronta.campi,
          bambini,
          genitoreNome,
          telefono,
          email,
          bambinoNome,
          bambinoEta,
          ...(note ? { note } : {}),
          consensoPrivacy: true,
          creataIl: new Date().toISOString(),
        })
        .commit();
    } catch (err) {
      if (statoHttp(err) === 409) {
        // Qualcun altro ha prenotato nello stesso istante: rileggi e riprova.
        await pausa(40 + Math.random() * 120 * (tentativo + 1));
        continue;
      }
      if (statoHttp(err) === 429) {
        // Sanity chiede di rallentare: aspetta un po' di più e riprova.
        await pausa(600 * (tentativo + 1) + Math.random() * 300);
        continue;
      }
      throw err;
    }

    return {
      esito: {
        codice,
        stato,
        bambini,
        quando: pronta.quando,
        cosa: pronta.cosa,
      },
      famiglia: {
        genitoreNome,
        telefono,
        email,
        bambinoNome,
        bambinoEta,
        note,
        bambini,
      },
      contatti: foto.contatti,
    };
  }

  throw new ErrorePrenotazione(TROPPE_RICHIESTE, 503);
}

/* ------------------------------ Pulizia periodica ----------------------------- */

/**
 * Elimina le prenotazioni più vecchie del periodo di conservazione impostato
 * nello Studio (privacy: i dati non si tengono più del necessario).
 */
export async function eliminaPrenotazioniVecchie() {
  const mesi = intero(
    await serverClient.fetch<number | null>(
      `*[_id == "impostazioniPrenotazioni"][0].mesiConservazione`
    ),
    3,
    1
  );

  const limite = new Date(`${oraRoma().data}T00:00:00Z`);
  limite.setUTCMonth(limite.getUTCMonth() - mesi);
  const params = { limite: limite.toISOString().slice(0, 10) };
  const filtro = `*[_type == "prenotazione" && data < $limite]`;

  const eliminate = await serverClient.fetch<number>(`count(${filtro})`, params);
  if (eliminate > 0) {
    await serverClient.delete({ query: filtro, params });
  }
  return { eliminate, primaDel: params.limite, mesi };
}

/* -------------------------- Annullamento dal genitore ------------------------- */

export interface PrenotazioneAnnullata {
  codice: string;
  cosa: string;
  quando: string;
  bambini: number;
  genitoreNome: string;
  email: string;
  contatti: Contatti | null;
  /** true se era già stata annullata prima di questa richiesta. */
  giaAnnullata: boolean;
}

const CODICE = /^LUP-[A-Z0-9]{6}$/;

/**
 * Annulla una prenotazione su richiesta del genitore.
 * Servono sia il codice sia l'email usata per prenotare: il codice da solo non
 * basta, così non si può annullare la prenotazione di un altro tirando a caso.
 * I posti tornano liberi subito. Dopo l'inizio non si può più annullare online.
 */
export async function annullaPrenotazione(
  body: unknown
): Promise<PrenotazioneAnnullata> {
  const b = (body && typeof body === "object" ? body : {}) as Record<
    string,
    unknown
  >;
  const codice = testo(b.codice, 12).toUpperCase();
  const email = testo(b.email, 120).toLowerCase();
  if (!CODICE.test(codice) || !EMAIL.test(email)) {
    throw new ErrorePrenotazione(
      "Inserisci il codice (es. LUP-ABC123) e l'email usata per prenotare."
    );
  }

  const trovata = await serverClient.fetch<{
    prenotazione: {
      _id: string;
      stato?: string;
      tipo?: string;
      data?: string;
      oraInizio?: string;
      oraFine?: string;
      eventoTitolo?: string;
      bambini?: number;
      genitoreNome?: string;
    } | null;
    contatti: Contatti | null;
  }>(
    `{
      "prenotazione": *[_type == "prenotazione" && codice == $codice && email == $email][0]{
        _id, stato, tipo, data, oraInizio, oraFine, eventoTitolo, bambini, genitoreNome
      },
      "contatti": ${NEGOZIO}
    }`,
    { codice, email }
  );

  const p = trovata.prenotazione;
  if (!p || !p.data) {
    throw new ErrorePrenotazione(
      "Non troviamo una prenotazione con questo codice e questa email.",
      404
    );
  }

  const giorno = formattaData(p.data);
  const riepilogo: PrenotazioneAnnullata = {
    codice,
    cosa: p.tipo === "evento" ? p.eventoTitolo || "Evento" : "Ludoteca",
    quando: `${giorno.charAt(0).toUpperCase()}${giorno.slice(1)}${
      p.oraInizio ? ` · ${p.oraInizio}${p.oraFine ? ` – ${p.oraFine}` : ""}` : ""
    }`,
    bambini: p.bambini ?? 1,
    genitoreNome: p.genitoreNome || "",
    email,
    contatti: trovata.contatti,
    giaAnnullata: p.stato === "annullata",
  };
  if (riepilogo.giaAnnullata) return riepilogo;

  if (minutiDaAdesso(p.data, p.oraInizio || "00:00") <= 0) {
    throw new ErrorePrenotazione(
      "Questa prenotazione è già iniziata o passata: per qualsiasi cosa contattaci direttamente.",
      409
    );
  }

  await serverClient
    .patch(p._id)
    .set({ stato: "annullata", annullataIl: new Date().toISOString() })
    .commit();
  return riepilogo;
}
