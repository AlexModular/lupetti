import { createClient } from "@sanity/client";
const c = createClient({ projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID, dataset: process.env.NEXT_PUBLIC_SANITY_DATASET, token: process.env.SANITY_API_WRITE_TOKEN, apiVersion: "2025-02-19", useCdn: false });
const q = `*[_type == "prenotazione" && genitoreNome == "TEST Collaudo"]`;
const n = await c.fetch(`count(${q})`);
if (n) await c.delete({ query: q });
console.log(`prenotazioni di collaudo eliminate: ${n}; rimaste in totale: ${await c.fetch('count(*[_type == "prenotazione"])')}`);
