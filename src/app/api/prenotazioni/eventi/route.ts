import { NextResponse } from "next/server";

import { disponibilitaEventi } from "@/lib/prenotazioni";

export const dynamic = "force-dynamic";

/** Posti rimasti per ogni laboratorio/evento in programma. Solo numeri. */
export async function GET() {
  try {
    return NextResponse.json(
      { disponibilita: await disponibilitaEventi() },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("GET /api/prenotazioni/eventi:", error);
    return NextResponse.json(
      { error: "Non riusciamo a caricare i posti disponibili." },
      { status: 500 }
    );
  }
}
