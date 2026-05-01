/**
 * Smoke test firma email (Kalshi-style + Tiffany) via Resend.
 *
 * Uso (da radice progetto):
 *   npx tsx scripts/send-pm-email-footer-test.ts tua-email@dominio.it
 *
 * Legge `.env.local` poi `.env` per RESEND_API_KEY e EMAIL_FROM.
 */
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = "development";
}

import { sendEmail } from "../lib/email";

async function main() {
  const to = process.argv[2]?.trim();
  if (!to) {
    console.error("Uso: npx tsx scripts/send-pm-email-footer-test.ts <email>");
    process.exit(1);
  }

  const result = await sendEmail({
    to,
    subject: "[PredictionMaster] Prova — banner PNG in header",
    html: `
      <p style="margin:0 0 14px;font-size:18px;line-height:1.5;color:#f1f5f9;font-weight:500;">Ciao Lorenzo,</p>
      <p style="margin:0 0 12px;line-height:1.6;color:#94a3b8;font-size:16px;">
        Sopra c’è il banner PNG (file in public/email/prediction-master-header-banner.png).
      </p>
      <p style="margin:0;color:#64748b;line-height:1.6;font-size:15px;">
        Dimmi se la resa ti convince su iPhone Mail e Gmail.
      </p>
    `,
    text:
      "Ciao Lorenzo,\nMail di prova: header tiffany sullo sfondo, corpo solo testo.\npredictionmaster.it\n",
  });

  if (!result.ok) {
    console.error("Invio fallito:", result.error ?? "unknown");
    process.exit(2);
  }
  console.log("Inviato a:", to);
}

main().catch((e) => {
  console.error(e);
  process.exit(2);
});
