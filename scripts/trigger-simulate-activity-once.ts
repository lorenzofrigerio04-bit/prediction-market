/**
 * Chiama l'endpoint cron simulate-activity sulla tua app (es. produzione).
 * Uso: dopo il deploy, esegui una volta per far partire subito i bot.
 *   npx tsx scripts/trigger-simulate-activity-once.ts
 * Richiede in .env: CRON_SECRET e NEXTAUTH_URL (o NEXT_PUBLIC_SITE_URL) con l'URL dell'app (es. https://xxx.vercel.app).
 */

import "dotenv/config";
import { getCanonicalBaseUrl } from "../lib/canonical-base-url";

const baseUrl = getCanonicalBaseUrl();
const cronSecret = process.env.CRON_SECRET?.trim();

if (!cronSecret) {
  console.error("Imposta CRON_SECRET in .env");
  process.exit(1);
}

const url = `${baseUrl}/api/cron/simulate-activity`;
console.log("Chiamata a", url, "...");

fetch(url, {
  method: "GET",
  headers: { Authorization: `Bearer ${cronSecret}` },
})
  .then(async (res) => {
    const data = await res.json();
    if (!res.ok) {
      console.error("Errore", res.status, data);
      process.exit(1);
    }
    console.log("OK:", JSON.stringify(data, null, 2));
  })
  .catch((err) => {
    console.error("Request failed:", err);
    process.exit(1);
  });
