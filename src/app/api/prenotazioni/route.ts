import { after, NextResponse, type NextRequest } from "next/server";

import { inviaEmailPrenotazione } from "@/lib/email";
import { ipDi, troppeRichieste } from "@/lib/freno";
import {
  creaPrenotazione,
  ErrorePrenotazione,
  leggiRichiesta,
} from "@/lib/prenotazioni";

export const dynamic = "force-dynamic";

/**
 * Crea una prenotazione (laboratorio/evento oppure ludoteca a ore).
 * Risponde solo con il riepilogo per chi ha prenotato: nessun dato di altri.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);

    // Campo trappola: i genitori non lo vedono, i bot lo compilano.
    if (body && typeof body === "object" && body.sito) {
      return NextResponse.json({ error: "Richiesta non valida." }, { status: 400 });
    }

    // Al massimo 8 prenotazioni ogni 10 minuti per indirizzo.
    if (troppeRichieste("prenota", ipDi(req.headers), 8)) {
      return NextResponse.json(
        {
          error:
            "Hai fatto molte prenotazioni in poco tempo. Riprova tra qualche minuto o contattaci direttamente.",
        },
        { status: 429 }
      );
    }

    const salvata = await creaPrenotazione(leggiRichiesta(body));

    // Le email partono dopo la risposta, così il genitore non aspetta.
    after(() => inviaEmailPrenotazione(salvata));

    return NextResponse.json({ prenotazione: salvata.esito }, { status: 201 });
  } catch (error) {
    if (error instanceof ErrorePrenotazione) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("POST /api/prenotazioni:", error);
    return NextResponse.json(
      {
        error:
          "Non siamo riusciti a salvare la prenotazione. Riprova tra poco o contattaci.",
      },
      { status: 500 }
    );
  }
}
