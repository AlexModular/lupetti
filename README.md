# I Lupetti • Giocattoleria ★ Ludoteca

Sito di **I Lupetti** (giocattoleria e ludoteca a Bologna), fatto con
**Next.js 15** (App Router), **Tailwind CSS** e **Sanity** come CMS.
Stessa impostazione di Da Lucia e Donna Sofì: pagine composte da blocchi
riordinabili, Studio montato dentro il sito.

## Avvio in locale

```bash
npm install
cp .env.example .env.local   # poi compila i valori
npm run dev
```

- Sito: `http://localhost:3000`
- Studio (gestione contenuti e prenotazioni): `http://localhost:3000/studio`

Al primo accesso allo Studio, Sanity chiede di autorizzare l'indirizzo
(`http://localhost:3000`, poi quello di produzione) tra le origini CORS del
progetto: basta confermare, oppure aggiungerlo da sanity.io/manage → API.

Serve Node 22. Le versioni più recenti di Sanity (4+) richiedono Node 22.12 o
superiore: per ora il progetto resta su Sanity 3, come gli altri due siti.

## Variabili d'ambiente

Sono descritte una per una in [.env.example](.env.example). In breve:

| Variabile | A cosa serve |
| --- | --- |
| `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET` | Progetto e dataset Sanity |
| `SANITY_API_WRITE_TOKEN` | Token "Editor": salva le prenotazioni, legge le bozze. Solo server |
| `NEXT_PUBLIC_SITE_URL` | Indirizzo pubblico del sito (sitemap, anteprime social) |
| `SMTP_SERVER_*`, `SITE_MAIL_RECIEVER` | Email di conferma e avviso. Facoltative |
| `CRON_SECRET` | Protegge la pulizia automatica delle prenotazioni vecchie |

## Dove stanno le cose

| Cartella | Contenuto |
| --- | --- |
| `src/sanity/schemaTypes/` | Tipi di contenuto: pagine, eventi, prenotazioni, impostazioni, blocchi |
| `src/sanity/structure.ts` | Menu laterale dello Studio (sezione Prenotazioni compresa) |
| `src/sanity/lib/queries.ts` | Query GROQ del sito |
| `src/components/blocks/` | Come ogni blocco viene disegnato sul sito |
| `src/components/PageMaker.tsx` | Associa ogni blocco al suo componente |
| `src/lib/prenotazioni.ts` | Posti disponibili e salvataggio delle prenotazioni |
| `src/lib/orari.ts` | Orari, fasce orarie, date (sempre ora di Bologna) |
| `src/app/api/` | API: prenotazioni, anteprima bozze, pulizia automatica |
| `scripts/seed-sanity.mjs` | Carica i contenuti iniziali in un dataset (`npm run seed`) |

### Aggiungere un blocco

1. Definisci il tipo in `src/sanity/schemaTypes/blocchiTypes.ts` e aggiungilo
   all'elenco `blocchiTypes`.
2. Aggiungi il nome a `BLOCCHI` (e a un gruppo del menu) in `pageType.ts`.
3. Aggiungi il tipo TypeScript in `src/types.ts`.
4. Crea il componente in `src/components/blocks/` e collegalo in `PageMaker.tsx`.
5. Se il blocco ha link o elenchi di documenti, completa `PAGE_BUILDER` in
   `queries.ts`.

## Prenotazioni

Ci sono due tipi di prenotazione, entrambi a numero chiuso:

- **Laboratori ed eventi**: data fissa, posti definiti su ogni evento.
- **Ludoteca a ore**: fasce di un'ora ricavate dagli orari di apertura
  (Impostazioni generali). Ogni ora ospita al massimo N bambini: N, le regole
  e le chiusure si impostano in «Impostazioni prenotazioni». Su ogni evento si
  sceglie cosa succede alla ludoteca durante il suo svolgimento: di norma è
  chiusa (non prenotabile), ma può restare aperta o avere capienza ridotta.

Le prenotazioni sono confermate subito (si può cambiare in «Impostazioni
prenotazioni»). Il genitore può annullare da solo dal sito, con il codice
ricevuto e l'email usata per prenotare, fino all'orario di inizio.

Dallo Studio, sezione **Prenotazioni**, si annulla impostando lo stato
«Annullata». In entrambi i casi i posti tornano subito liberi.

### Dati personali

Il piano gratuito di Sanity ha solo dataset pubblici. Le prenotazioni restano
private perché vengono salvate con un ID che contiene un punto
(`prenotazione.<uuid>`): Sanity rende quei documenti leggibili solo con un
token. Per questo:

- le prenotazioni si creano **solo dal sito**, mai dallo Studio (creazione e
  duplicazione sono disattivate: avrebbero un ID pubblico);
- il token non va mai esposto al browser;
- al browser arrivano solo i numeri dei posti liberi.

Le prenotazioni passate vengono eliminate dopo i mesi indicati in
«Impostazioni prenotazioni» (3 di default) dalla rotta `/api/cron/pulizia`,
chiamata ogni notte dal cron definito in `vercel.json`. Serve `CRON_SECRET`.

### Niente overbooking

I posti liberi si calcolano sommando le prenotazioni esistenti. Ogni
salvataggio passa da un documento "lucchetto" (`sistema.lock-prenotazioni`):
se due genitori prenotano nello stesso istante, il secondo viene ricontrollato
sui posti aggiornati. Dettagli in testa a `src/lib/prenotazioni.ts`.

## Deploy su Vercel

1. Collega il repository a Vercel.
2. Imposta le variabili d'ambiente (vedi sopra), compreso `CRON_SECRET`.
3. Aggiungi il dominio di produzione alle origini CORS del progetto Sanity,
   con le credenziali consentite, per poter usare lo Studio online.
