import { after, NextResponse, type NextRequest } from "next/server";

import { inviaEmailAnnullamento } from "@/lib/email";
import { ipDi, troppeRichieste } from "@/lib/freno";
import { annullaPrenotazione, ErrorePrenotazione } from "@/lib/prenotazioni";

export const dynamic = "force-dynamic";

/**
 * Annullamento da parte del genitore: servono codice ed email.
 * Pochi tentativi per indirizzo, per non lasciar indovinare i codici.
 */
export async function POST(req: NextRequest) {
  try {
    if (troppeRichieste("annulla", ipDi(req.headers), 6)) {
      return NextResponse.json(
        { error: "Troppi tentativi. Riprova tra qualche minuto o contattaci." },
        { status: 429 }
      );
    }
    const annullata = await annullaPrenotazione(await req.json().catch(() => null));
    if (!annullata.giaAnnullata) after(() => inviaEmailAnnullamento(annullata));

    const { codice, cosa, quando, bambini, giaAnnullata } = annullata;
    return NextResponse.json({
      annullata: { codice, cosa, quando, bambini, giaAnnullata },
    });
  } catch (error) {
    if (error instanceof ErrorePrenotazione) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("POST /api/prenotazioni/annulla:", error);
    return NextResponse.json(
      { error: "Non siamo riusciti ad annullare. Riprova tra poco o contattaci." },
      { status: 500 }
    );
  }
}
