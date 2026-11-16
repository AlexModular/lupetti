import { NextResponse, type NextRequest } from "next/server";

import { isData } from "@/lib/orari";
import { disponibilitaLudoteca } from "@/lib/prenotazioni";

export const dynamic = "force-dynamic";

/**
 * Fasce orarie della ludoteca per un giorno, con i posti rimasti.
 * GET /api/prenotazioni/ludoteca?data=2026-11-21
 */
export async function GET(req: NextRequest) {
  const data = req.nextUrl.searchParams.get("data");
  if (!isData(data)) {
    return NextResponse.json({ error: "Giorno non valido." }, { status: 400 });
  }
  try {
    return NextResponse.json(await disponibilitaLudoteca(data), {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("GET /api/prenotazioni/ludoteca:", error);
    return NextResponse.json(
      { error: "Non riusciamo a caricare i posti disponibili." },
      { status: 500 }
    );
  }
}
