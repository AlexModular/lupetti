# I Lupetti • Giocattoleria ★ Ludoteca

Sito web ufficiale per **I Lupetti (Giocattoleria & Ludoteca)** realizzato con **Next.js 14 (App Router)**, **Tailwind CSS** e **Keystatic CMS** (CMS Git-based 100% gratuito, senza costi di database).

## Avvio in Locale

```bash
npm install
npm run dev
```

- **Sito Web**: `http://localhost:3000`
- **Pannello Admin CMS (Keystatic)**: `http://localhost:3000/keystatic`

## Come funziona il CMS Gratuito (Keystatic)

Tutti i contenuti del sito sono salvati direttamente nel progetto in formato JSON leggibile dentro `src/content/`:
- `src/content/impostazioni/index.json` → Titoli, testi Chi Siamo, telefono, WhatsApp, email, indirizzo e orari di apertura
- `src/content/servizi/*.json` → Card dei servizi (Ludoteca, Feste, Laboratori, Giocattoleria)
- `src/content/pacchetti-feste/*.json` → Listino e caratteristiche dei pacchetti Feste di Compleanno
- `src/content/eventi/*.json` → Calendario laboratori, eventi in programma e novità giocattoleria
- `src/content/galleria/*.json` → Foto della galleria divise per categoria

### Deploy 100% Gratuito (Cloudflare Pages / Netlify / Vercel)

1. Carica il progetto su un repository **GitHub**.
2. Collega il repository a **Cloudflare Pages**, **Netlify** o **Vercel**.
3. *(Opzionale per modificare dal web in produzione)* Imposta le variabili d'ambiente:
   - `NEXT_PUBLIC_KEYSTATIC_GITHUB_OWNER`: tuo username GitHub
   - `NEXT_PUBLIC_KEYSTATIC_GITHUB_REPO`: nome del repository
   Al primo accesso su `/keystatic` in produzione, Keystatic ti guiderà nella creazione automatica della GitHub App gratuita per salvare le modifiche direttamente sul repository con un clic.

