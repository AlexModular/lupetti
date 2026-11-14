import fs from "node:fs";
import path from "node:path";

export interface BookingRecord {
  id: number;
  booking_code: string;
  event_slug: string;
  event_title: string;
  event_date: string;
  parent_name: string;
  parent_email: string;
  parent_phone: string;
  child_name: string;
  child_age: string;
  spots: number;
  notes: string;
  status: string;
  created_at: string;
}

export interface CreateBookingInput {
  event_slug: string;
  event_title: string;
  event_date: string;
  max_capacity: number;
  parent_name: string;
  parent_email: string;
  parent_phone: string;
  child_name: string;
  child_age: string;
  spots: number;
  notes?: string;
}

export class CapacityError extends Error {
  remainingSpots: number;
  constructor(message: string, remainingSpots: number) {
    super(message);
    this.name = "CapacityError";
    this.remainingSpots = remainingSpots;
  }
}

// Support both Turso Cloud SQLite (100% free serverless DB for Vercel/Cloudflare)
// and local built-in SQLite (data/prenotazioni.sqlite) out of the box.
const TURSO_URL = process.env.TURSO_DATABASE_URL;
const TURSO_TOKEN = process.env.TURSO_AUTH_TOKEN;
const isTursoConfigured = Boolean(TURSO_URL && TURSO_TOKEN);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let localDbInstance: any = null;

function getLocalDb() {
  if (localDbInstance) return localDbInstance;

  // Dynamic require for Node's built-in sqlite module
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { DatabaseSync } = require("node:sqlite");
  const dataDir = path.join(process.cwd(), "data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  const dbPath = path.join(dataDir, "prenotazioni.sqlite");
  const db = new DatabaseSync(dbPath);

  db.exec(`
    CREATE TABLE IF NOT EXISTS prenotazioni (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      booking_code TEXT NOT NULL UNIQUE,
      event_slug TEXT NOT NULL,
      event_title TEXT NOT NULL,
      event_date TEXT NOT NULL,
      parent_name TEXT NOT NULL,
      parent_email TEXT NOT NULL,
      parent_phone TEXT NOT NULL,
      child_name TEXT NOT NULL,
      child_age TEXT NOT NULL,
      spots INTEGER NOT NULL DEFAULT 1,
      notes TEXT DEFAULT '',
      status TEXT NOT NULL DEFAULT 'confirmed',
      created_at TEXT NOT NULL
    );
  `);

  // Seed initial demo booking if table is completely empty
  const countRow = db
    .prepare("SELECT COUNT(*) as total FROM prenotazioni")
    .get() as { total: number };
  if (countRow.total === 0) {
    const insert = db.prepare(`
      INSERT INTO prenotazioni (
        booking_code, event_slug, event_title, event_date,
        parent_name, parent_email, parent_phone,
        child_name, child_age, spots, notes, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'confirmed', ?)
    `);
    insert.run(
      "LUP-1042",
      "laboratorio-argilla",
      "Piccoli Artisti: Modelliamo i Lupetti in Argilla",
      "Sabato 21 Novembre • Ore 16:30 – 18:00",
      "Elena Bianchi",
      "elena.bianchi@example.com",
      "333 9876543",
      "Matteo",
      "6 anni",
      2,
      "Partecipa anche la sorellina Sofia (5 anni)",
      new Date().toISOString()
    );
    insert.run(
      "LUP-1089",
      "letture-animate-bosco",
      "Letture Animate nel Bosco Incantato",
      "Mercoledì 25 Novembre • Ore 17:00 – 18:15",
      "Marco Verdi",
      "marco.verdi@example.com",
      "347 1122334",
      "Aurora",
      "4 anni",
      1,
      "",
      new Date().toISOString()
    );
  }

  localDbInstance = db;
  return db;
}

async function tursoExecute(sql: string, args: (string | number)[] = []) {
  const httpUrl = TURSO_URL!.replace(/^libsql:\/\//, "https://");
  const res = await fetch(`${httpUrl}/v2/pipeline`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${TURSO_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      requests: [
        {
          type: "execute",
          stmt: {
            sql,
            args: args.map((a) =>
              typeof a === "number"
                ? { type: "integer", value: String(a) }
                : { type: "text", value: String(a) }
            ),
          },
        },
        { type: "close" },
      ],
    }),
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Errore database Turso: ${res.statusText}`);
  }
  const data = await res.json();
  const result = data?.results?.[0]?.response?.result;
  if (!result) return [];
  const cols: string[] = result.cols.map((c: { name: string }) => c.name);
  return result.rows.map((row: { value: string | number }[]) => {
    const obj: Record<string, string | number> = {};
    cols.forEach((col, i) => {
      obj[col] = row[i]?.value;
    });
    return obj;
  });
}

export async function getBookedSpotsByEvent(): Promise<Record<string, number>> {
  if (isTursoConfigured) {
    await tursoExecute(`
      CREATE TABLE IF NOT EXISTS prenotazioni (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        booking_code TEXT NOT NULL UNIQUE,
        event_slug TEXT NOT NULL,
        event_title TEXT NOT NULL,
        event_date TEXT NOT NULL,
        parent_name TEXT NOT NULL,
        parent_email TEXT NOT NULL,
        parent_phone TEXT NOT NULL,
        child_name TEXT NOT NULL,
        child_age TEXT NOT NULL,
        spots INTEGER NOT NULL DEFAULT 1,
        notes TEXT DEFAULT '',
        status TEXT NOT NULL DEFAULT 'confirmed',
        created_at TEXT NOT NULL
      );
    `);
    const rows = await tursoExecute(
      "SELECT event_slug, COALESCE(SUM(spots), 0) as total_spots FROM prenotazioni WHERE status = 'confirmed' GROUP BY event_slug"
    );
    const map: Record<string, number> = {};
    for (const r of rows) {
      map[String(r.event_slug)] = Number(r.total_spots || 0);
    }
    return map;
  }

  const db = getLocalDb();
  const rows = db
    .prepare(
      "SELECT event_slug, COALESCE(SUM(spots), 0) as total_spots FROM prenotazioni WHERE status = 'confirmed' GROUP BY event_slug"
    )
    .all() as { event_slug: string; total_spots: number }[];

  const map: Record<string, number> = {};
  for (const r of rows) {
    map[r.event_slug] = Number(r.total_spots || 0);
  }
  return map;
}

export async function listAllBookings(eventSlug?: string): Promise<BookingRecord[]> {
  if (isTursoConfigured) {
    const rows = eventSlug
      ? await tursoExecute(
          "SELECT * FROM prenotazioni WHERE event_slug = ? ORDER BY created_at DESC",
          [eventSlug]
        )
      : await tursoExecute("SELECT * FROM prenotazioni ORDER BY created_at DESC");
    return rows.map((r: Record<string, string | number>) => ({
      id: Number(r.id),
      booking_code: String(r.booking_code),
      event_slug: String(r.event_slug),
      event_title: String(r.event_title),
      event_date: String(r.event_date),
      parent_name: String(r.parent_name),
      parent_email: String(r.parent_email),
      parent_phone: String(r.parent_phone),
      child_name: String(r.child_name),
      child_age: String(r.child_age),
      spots: Number(r.spots),
      notes: String(r.notes || ""),
      status: String(r.status),
      created_at: String(r.created_at),
    }));
  }

  const db = getLocalDb();
  if (eventSlug) {
    return db
      .prepare(
        "SELECT * FROM prenotazioni WHERE event_slug = ? ORDER BY id DESC"
      )
      .all(eventSlug) as BookingRecord[];
  }
  return db
    .prepare("SELECT * FROM prenotazioni ORDER BY id DESC")
    .all() as BookingRecord[];
}

export async function createBooking(
  input: CreateBookingInput
): Promise<BookingRecord> {
  const spotsRequested = Math.max(1, Math.min(5, Number(input.spots) || 1));
  const bookingCode = `LUP-${Math.floor(1000 + Math.random() * 9000)}`;
  const now = new Date().toISOString();

  if (isTursoConfigured) {
    const rows = await tursoExecute(
      "SELECT COALESCE(SUM(spots), 0) as booked FROM prenotazioni WHERE event_slug = ? AND status = 'confirmed'",
      [input.event_slug]
    );
    const currentBooked = Number(rows[0]?.booked || 0);
    const remaining = Math.max(0, input.max_capacity - currentBooked);

    if (spotsRequested > remaining) {
      throw new CapacityError(
        remaining === 0
          ? "Posti esauriti per questo laboratorio/turno."
          : `Disponibilità insufficiente: rimangono solo ${remaining} posti disponibili.`,
        remaining
      );
    }

    await tursoExecute(
      `INSERT INTO prenotazioni (
        booking_code, event_slug, event_title, event_date,
        parent_name, parent_email, parent_phone,
        child_name, child_age, spots, notes, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'confirmed', ?)`,
      [
        bookingCode,
        input.event_slug,
        input.event_title,
        input.event_date,
        input.parent_name,
        input.parent_email,
        input.parent_phone,
        input.child_name,
        input.child_age,
        spotsRequested,
        input.notes || "",
        now,
      ]
    );

    return {
      id: Date.now(),
      booking_code: bookingCode,
      event_slug: input.event_slug,
      event_title: input.event_title,
      event_date: input.event_date,
      parent_name: input.parent_name,
      parent_email: input.parent_email,
      parent_phone: input.parent_phone,
      child_name: input.child_name,
      child_age: input.child_age,
      spots: spotsRequested,
      notes: input.notes || "",
      status: "confirmed",
      created_at: now,
    };
  }

  const db = getLocalDb();
  db.exec("BEGIN IMMEDIATE");
  try {
    const row = db
      .prepare(
        "SELECT COALESCE(SUM(spots), 0) as booked FROM prenotazioni WHERE event_slug = ? AND status = 'confirmed'"
      )
      .get(input.event_slug) as { booked: number };

    const currentBooked = Number(row?.booked || 0);
    const remaining = Math.max(0, input.max_capacity - currentBooked);

    if (spotsRequested > remaining) {
      throw new CapacityError(
        remaining === 0
          ? "Posti esauriti per questo laboratorio/turno."
          : `Disponibilità insufficiente: rimangono solo ${remaining} posti disponibili.`,
        remaining
      );
    }

    const result = db
      .prepare(
        `INSERT INTO prenotazioni (
          booking_code, event_slug, event_title, event_date,
          parent_name, parent_email, parent_phone,
          child_name, child_age, spots, notes, status, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'confirmed', ?)`
      )
      .run(
        bookingCode,
        input.event_slug,
        input.event_title,
        input.event_date,
        input.parent_name,
        input.parent_email,
        input.parent_phone,
        input.child_name,
        input.child_age,
        spotsRequested,
        input.notes || "",
        now
      );

    db.exec("COMMIT");

    return {
      id: Number(result.lastInsertRowid),
      booking_code: bookingCode,
      event_slug: input.event_slug,
      event_title: input.event_title,
      event_date: input.event_date,
      parent_name: input.parent_name,
      parent_email: input.parent_email,
      parent_phone: input.parent_phone,
      child_name: input.child_name,
      child_age: input.child_age,
      spots: spotsRequested,
      notes: input.notes || "",
      status: "confirmed",
      created_at: now,
    };
  } catch (err) {
    db.exec("ROLLBACK");
    throw err;
  }
}

export async function cancelBookingById(id: number): Promise<void> {
  if (isTursoConfigured) {
    await tursoExecute("DELETE FROM prenotazioni WHERE id = ?", [id]);
    return;
  }
  const db = getLocalDb();
  db.prepare("DELETE FROM prenotazioni WHERE id = ?").run(id);
}

