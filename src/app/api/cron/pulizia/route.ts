import { NextResponse, type NextRequest } from "next/server";

import { eliminaPrenotazioniVecchie } from "@/lib/prenotazioni";

export const dynamic = "force-dynamic";

/**
 * Pulizia automatica delle prenotazioni vecchie (vedi vercel.json).
 * Vercel chiama questa rotta una volta al giorno inviando
 * "Authorization: Bearer <CRON_SECRET>": senza quel segreto non fa nulla.
 */
export async function GET(req: NextRequest) {
  const segreto = process.env.CRON_SECRET;
  if (!segreto) {
    return NextResponse.json(
      { error: "CRON_SECRET non impostato: pulizia disattivata." },
      { status: 503 }
    );
  }
  if (req.headers.get("authorization") !== `Bearer ${segreto}`) {
    return NextResponse.json({ error: "Non autorizzato." }, { status: 401 });
  }
  try {
    return NextResponse.json(await eliminaPrenotazioniVecchie());
  } catch (error) {
    console.error("GET /api/cron/pulizia:", error);
    return NextResponse.json({ error: "Pulizia non riuscita." }, { status: 500 });
  }
}
