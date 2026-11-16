import "server-only";

import nodemailer from "nodemailer";

import type { PrenotazioneAnnullata, PrenotazioneSalvata } from "./prenotazioni";

/**
 * Email di conferma al genitore e di avviso al negozio.
 *
 * Usa le stesse variabili d'ambiente degli altri siti (Da Lucia, Donna Sofì).
 * Se non sono impostate le email vengono semplicemente saltate: la
 * prenotazione resta comunque salvata e visibile nello Studio.
 */
const {
  SMTP_SERVER_HOST: host,
  SMTP_SERVER_PORT: port,
  SMTP_SERVER_USERNAME: user,
  SMTP_SERVER_PASSWORD: pass,
  SMTP_FROM: from,
  SITE_MAIL_RECIEVER: destinatarioNegozio,
} = process.env;

export const emailConfigurata = Boolean(host && user && pass);

const trasporto = emailConfigurata
  ? nodemailer.createTransport({
      host,
      port: Number(port) || 465,
      secure: (Number(port) || 465) === 465,
      auth: { user, pass },
    })
  : null;

const esc = (s: string | number | null | undefined) =>
  String(s ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ] as string
  );

const riga = (etichetta: string, valore: string | number) =>
  `<tr><td style="padding:4px 12px 4px 0;color:#64748b">${esc(
    etichetta
  )}</td><td style="padding:4px 0"><strong>${esc(valore)}</strong></td></tr>`;

const pagina = (titolo: string, corpo: string) => `
<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#334155;max-width:560px">
  <h2 style="color:#388577;margin:0 0 12px">${esc(titolo)}</h2>
  ${corpo}
</div>`;

export async function inviaEmailPrenotazione({
  esito,
  famiglia,
  contatti,
}: PrenotazioneSalvata) {
  if (!trasporto) return;

  const nome = contatti?.negozio?.nomeAttivita || "I Lupetti";
  const mittente = from || user;
  const negozio =
    destinatarioNegozio || contatti?.emailNotifiche || contatti?.negozio?.email;
  const bambini = `${esito.bambini} ${esito.bambini === 1 ? "bambino" : "bambini"}`;
  const confermata = esito.stato === "confermata";

  const riepilogo = `<table style="border-collapse:collapse;margin:12px 0">
    ${riga("Cosa", esito.cosa)}
    ${riga("Quando", esito.quando)}
    ${riga("Per", bambini)}
    ${riga("Codice", esito.codice)}
  </table>`;

  const invii: Promise<unknown>[] = [
    trasporto.sendMail({
      from: `"${nome.replace(/"/g, "")}" <${mittente}>`,
      to: famiglia.email,
      replyTo: negozio || undefined,
      subject: confermata
        ? `Prenotazione confermata · ${esito.codice}`
        : `Richiesta di prenotazione ricevuta · ${esito.codice}`,
      html: pagina(
        confermata ? "Prenotazione confermata!" : "Abbiamo ricevuto la tua richiesta",
        `<p>Ciao ${esc(famiglia.genitoreNome)},</p>
         <p>${
           confermata
             ? "ti aspettiamo! Ecco il riepilogo della prenotazione:"
             : "la tua richiesta è in attesa di conferma: ti ricontattiamo al più presto. I posti sono già riservati."
         }</p>
         ${riepilogo}
         <p>Per annullare vai sul sito, nella pagina delle prenotazioni, e scegli
         «Annulla una prenotazione»: ti servono questo codice e la tua email.
         Per modificarla rispondi a questa email${
           contatti?.negozio?.telefono
             ? ` oppure chiamaci al ${esc(contatti.negozio.telefono)}`
             : ""
         }.</p>
         <p>A presto,<br>${esc(nome)}</p>`
      ),
    }),
  ];

  if (negozio) {
    invii.push(
      trasporto.sendMail({
        from: `"Sito ${nome.replace(/"/g, "")}" <${mittente}>`,
        to: negozio,
        replyTo: famiglia.email,
        subject: `${confermata ? "Nuova prenotazione" : "Prenotazione DA CONFERMARE"} · ${
          esito.cosa
        } · ${esito.quando}`,
        html: pagina(
          confermata ? "Nuova prenotazione" : "Prenotazione da confermare",
          `${riepilogo}
           <table style="border-collapse:collapse;margin:12px 0">
             ${riga("Genitore", famiglia.genitoreNome)}
             ${riga("Telefono", famiglia.telefono)}
             ${riga("Email", famiglia.email)}
             ${riga("Bambini", `${famiglia.bambinoNome} (${famiglia.bambinoEta})`)}
             ${famiglia.note ? riga("Note", famiglia.note) : ""}
           </table>
           <p>La trovi nello Studio, sezione Prenotazioni.</p>`
        ),
      })
    );
  }

  const risultati = await Promise.allSettled(invii);
  for (const r of risultati) {
    if (r.status === "rejected") {
      // L'email non deve mai far fallire una prenotazione già salvata.
      console.error("Invio email prenotazione non riuscito:", r.reason);
    }
  }
}

/** Avvisa negozio e genitore che una prenotazione è stata annullata dal sito. */
export async function inviaEmailAnnullamento(a: PrenotazioneAnnullata) {
  if (!trasporto) return;

  const nome = a.contatti?.negozio?.nomeAttivita || "I Lupetti";
  const mittente = from || user;
  const negozio =
    destinatarioNegozio || a.contatti?.emailNotifiche || a.contatti?.negozio?.email;
  const riepilogo = `<table style="border-collapse:collapse;margin:12px 0">
    ${riga("Cosa", a.cosa)}
    ${riga("Quando", a.quando)}
    ${riga("Per", `${a.bambini} ${a.bambini === 1 ? "bambino" : "bambini"}`)}
    ${riga("Codice", a.codice)}
  </table>`;

  const invii: Promise<unknown>[] = [
    trasporto.sendMail({
      from: `"${nome.replace(/"/g, "")}" <${mittente}>`,
      to: a.email,
      replyTo: negozio || undefined,
      subject: `Prenotazione annullata · ${a.codice}`,
      html: pagina(
        "Prenotazione annullata",
        `<p>Ciao ${esc(a.genitoreNome)},</p>
         <p>abbiamo annullato la tua prenotazione, come richiesto:</p>
         ${riepilogo}
         <p>A presto,<br>${esc(nome)}</p>`
      ),
    }),
  ];
  if (negozio) {
    invii.push(
      trasporto.sendMail({
        from: `"Sito ${nome.replace(/"/g, "")}" <${mittente}>`,
        to: negozio,
        replyTo: a.email,
        subject: `Prenotazione ANNULLATA dal genitore · ${a.cosa} · ${a.quando}`,
        html: pagina(
          "Prenotazione annullata dal genitore",
          `${riepilogo}<p>${esc(a.genitoreNome)} (${esc(a.email)}). I posti sono tornati liberi.</p>`
        ),
      })
    );
  }

  for (const r of await Promise.allSettled(invii)) {
    if (r.status === "rejected") {
      console.error("Invio email di annullamento non riuscito:", r.reason);
    }
  }
}
