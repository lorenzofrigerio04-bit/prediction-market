/**
 * Chiama l'endpoint cron simulate-activity sulla tua app (es. produzione).
 * Uso: dopo il deploy, esegui una volta per far partire subito i bot.
 *   npx tsx scripts/trigger-simulate-activity-once.ts
 * Richiede in .env: CRON_SECRET e NEXTAUTH_URL (o BASE_URL) con l'URL dell'app (es. https://xxx.vercel.app).
 */

import "dotenv/config";

const baseUrl =
  process.env.BASE_URL ||
  process.env.NEXTAUTH_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null);
const cronSecret = process.env.CRON_SECRET?.trim();

if (!baseUrl) {
  console.error("Imposta BASE_URL o NEXTAUTH_URL in .env (es. https://tuo-progetto.vercel.app)");
  process.exit(1);
}
if (!cronSecret) {
  console.error("Imposta CRON_SECRET in .env");
  process.exit(1);
}

const url = `${baseUrl.replace(/\/$/, "")}/api/cron/simulate-activity`;
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
