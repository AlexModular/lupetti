/**
 * Freno anti-abuso: limita quante richieste può fare lo stesso indirizzo IP in
 * 10 minuti. È tenuto in memoria, quindi vale per singola istanza del server:
 * non è una difesa completa, ma ferma chi prova a riempire i posti a raffica o
 * a indovinare i codici di prenotazione.
 */
const FINESTRA_MS = 10 * 60 * 1000;
const registri = new Map<string, number[]>();

export function ipDi(headers: Headers) {
  return headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "sconosciuto";
}

/** true se questo IP ha superato `max` richieste di tipo `ambito` in 10 minuti. */
export function troppeRichieste(ambito: string, ip: string, max: number) {
  const chiave = `${ambito}:${ip}`;
  const adesso = Date.now();
  const recenti = (registri.get(chiave) ?? []).filter(
    (t) => adesso - t < FINESTRA_MS
  );
  recenti.push(adesso);
  registri.set(chiave, recenti);
  if (registri.size > 5000) registri.clear();
  return recenti.length > max;
}
