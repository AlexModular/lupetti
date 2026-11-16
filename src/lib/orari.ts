/**
 * Orari, date e fasce orarie. Funzioni pure, usate sia dal server (controllo
 * dei posti) sia dal browser (calendario, badge "Aperto ora").
 *
 * Tutto ragiona con l'ora di Bologna (Europe/Rome), a prescindere dal fuso del
 * server o del telefono di chi naviga. Le date sono stringhe "AAAA-MM-GG" e
 * gli orari stringhe "HH:MM".
 */

export const FUSO = "Europe/Rome";

/** Durata di una fascia prenotabile in ludoteca. */
export const SLOT_MINUTI = 60;

// L'indice corrisponde a Date.getUTCDay(): 0 = domenica.
export const GIORNI = [
  "domenica",
  "lunedi",
  "martedi",
  "mercoledi",
  "giovedi",
  "venerdi",
  "sabato",
] as const;

export type Giorno = (typeof GIORNI)[number];

export interface FasciaOraria {
  dalle: string;
  alle: string;
}

export type OrariSettimanali = Partial<
  Record<Giorno, FasciaOraria[] | null | undefined>
>;

export interface Slot {
  /** Inizio, "HH:MM" */
  ora: string;
  /** Fine, "HH:MM" */
  fine: string;
}

const HHMM = /^([01]\d|2[0-3]):[0-5]\d$/;
const DATA = /^(\d{4})-(\d{2})-(\d{2})$/;

export const isOrario = (v: unknown): v is string =>
  typeof v === "string" && HHMM.test(v);

export const inMinuti = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

export const daMinuti = (minuti: number) =>
  `${String(Math.floor(minuti / 60)).padStart(2, "0")}:${String(
    minuti % 60
  ).padStart(2, "0")}`;

/** true se la stringa è una data reale nel formato AAAA-MM-GG. */
export function isData(v: unknown): v is string {
  if (typeof v !== "string") return false;
  const m = DATA.exec(v);
  if (!m) return false;
  const d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
  return d.toISOString().slice(0, 10) === v;
}

const daUTC = (data: string) => {
  const [y, m, d] = data.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
};

export const aggiungiGiorni = (data: string, giorni: number) => {
  const d = daUTC(data);
  d.setUTCDate(d.getUTCDate() + giorni);
  return d.toISOString().slice(0, 10);
};

export const giornoSettimana = (data: string): Giorno =>
  GIORNI[daUTC(data).getUTCDay()];

const formatoRoma = new Intl.DateTimeFormat("en-CA", {
  timeZone: FUSO,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

/** Data e ora a Bologna in un dato istante. */
export function oraRoma(istante: Date | string | number = new Date()) {
  const parti: Record<string, string> = {};
  for (const p of formatoRoma.formatToParts(new Date(istante))) {
    parti[p.type] = p.value;
  }
  const data = `${parti.year}-${parti.month}-${parti.day}`;
  const minuti = Number(parti.hour) * 60 + Number(parti.minute);
  return { data, minuti, ora: daMinuti(minuti) };
}

/**
 * Minuti di distanza tra "adesso" e un orario locale di un certo giorno.
 * Negativo se è già passato.
 */
export function minutiDaAdesso(
  data: string,
  ora: string,
  adesso: Date | number = new Date()
) {
  const ora0 = oraRoma(adesso);
  const giorni = Math.round(
    (daUTC(data).getTime() - daUTC(ora0.data).getTime()) / 86_400_000
  );
  return giorni * 1440 + inMinuti(ora) - ora0.minuti;
}

/** Fasce di apertura valide per una data, in ordine. */
export function fascePerData(
  orari: OrariSettimanali | null | undefined,
  data: string
): FasciaOraria[] {
  const fasce = orari?.[giornoSettimana(data)] ?? [];
  return fasce
    .filter(
      (f): f is FasciaOraria =>
        Boolean(f) && isOrario(f.dalle) && isOrario(f.alle) && f.alle > f.dalle
    )
    .sort((a, b) => a.dalle.localeCompare(b.dalle));
}

/**
 * Divide le fasce di apertura in turni da un'ora.
 * Es. 15:30–19:00 → 15:30, 16:30, 17:30 (l'ultima mezz'ora non basta per un turno).
 */
export function slotDaFasce(fasce: FasciaOraria[]): Slot[] {
  const slots: Slot[] = [];
  for (const fascia of fasce) {
    const fine = inMinuti(fascia.alle);
    for (
      let inizio = inMinuti(fascia.dalle);
      inizio + SLOT_MINUTI <= fine;
      inizio += SLOT_MINUTI
    ) {
      const ora = daMinuti(inizio);
      if (!slots.some((s) => s.ora === ora)) {
        slots.push({ ora, fine: daMinuti(inizio + SLOT_MINUTI) });
      }
    }
  }
  return slots.sort((a, b) => a.ora.localeCompare(b.ora));
}

/** Stato di apertura in questo momento. */
export function statoApertura(
  orari: OrariSettimanali | null | undefined,
  adesso: Date | number = new Date()
) {
  const { data, minuti } = oraRoma(adesso);
  const fasce = fascePerData(orari, data);
  const attuale = fasce.find(
    (f) => inMinuti(f.dalle) <= minuti && minuti < inMinuti(f.alle)
  );
  if (attuale) return { aperto: true as const, finoAlle: attuale.alle };
  const prossima = fasce.find((f) => inMinuti(f.dalle) > minuti);
  return { aperto: false as const, riapreAlle: prossima?.dalle ?? null };
}

const NOMI_BREVI: Record<Giorno, string> = {
  lunedi: "Lun",
  martedi: "Mar",
  mercoledi: "Mer",
  giovedi: "Gio",
  venerdi: "Ven",
  sabato: "Sab",
  domenica: "Dom",
};

const SETTIMANA: Giorno[] = [
  "lunedi",
  "martedi",
  "mercoledi",
  "giovedi",
  "venerdi",
  "sabato",
  "domenica",
];

/**
 * Riassume la settimana raggruppando i giorni consecutivi con gli stessi orari.
 * Es. [{ giorni: "Lun – Sab", orari: ["09:00 – 13:00", "15:30 – 19:00"] },
 *      { giorni: "Dom", orari: [] }]   (orari vuoto = chiuso)
 */
export function riepilogoOrari(orari: OrariSettimanali | null | undefined) {
  const righe: { giorni: string; orari: string[] }[] = [];
  let gruppo: { da: Giorno; a: Giorno; chiave: string; orari: string[] } | null =
    null;

  const chiudi = () => {
    if (!gruppo) return;
    righe.push({
      giorni:
        gruppo.da === gruppo.a
          ? NOMI_BREVI[gruppo.da]
          : `${NOMI_BREVI[gruppo.da]} – ${NOMI_BREVI[gruppo.a]}`,
      orari: gruppo.orari,
    });
  };

  for (const giorno of SETTIMANA) {
    const fasce = (orari?.[giorno] ?? [])
      .filter((f) => f && isOrario(f.dalle) && isOrario(f.alle))
      .sort((a, b) => a.dalle.localeCompare(b.dalle))
      .map((f) => `${f.dalle} – ${f.alle}`);
    const chiave = fasce.join("|");
    if (gruppo && gruppo.chiave === chiave) {
      gruppo.a = giorno;
    } else {
      chiudi();
      gruppo = { da: giorno, a: giorno, chiave, orari: fasce };
    }
  }
  chiudi();
  return righe;
}

/** "sabato 21 novembre" (con l'anno se richiesto). */
export function formattaData(
  data: string,
  opzioni: { anno?: boolean; breve?: boolean } = {}
) {
  return new Intl.DateTimeFormat("it-IT", {
    timeZone: "UTC",
    weekday: opzioni.breve ? "short" : "long",
    day: "numeric",
    month: opzioni.breve ? "short" : "long",
    ...(opzioni.anno ? { year: "numeric" } : {}),
  }).format(daUTC(data));
}

const maiuscola = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** "Sabato 21 novembre · 16:30 – 18:00" a partire da due istanti ISO. */
export function formattaEvento(inizio?: string | null, fine?: string | null) {
  if (!inizio) return "Data da definire";
  const da = oraRoma(inizio);
  const giorno = maiuscola(formattaData(da.data));
  if (!fine) return `${giorno} · ${da.ora}`;
  const a = oraRoma(fine);
  return a.data === da.data
    ? `${giorno} · ${da.ora} – ${a.ora}`
    : `${giorno} · ${da.ora} → ${formattaData(a.data, { breve: true })} ${a.ora}`;
}
