/**
 * Invio email (verifica account, ecc.).
 * Supporta Resend (consigliato) via API key.
 *
 * Variabili d'ambiente:
 * - RESEND_API_KEY: API key da https://resend.com/api-keys
 * - EMAIL_FROM: mittente. In produzione usa un indirizzo sul dominio verificato in Resend (es. "PredictionMaster <noreply@tuosito.it>").
 *   Senza EMAIL_FROM si usa onboarding@resend.dev (solo sandbox: recapito quasi solo verso il tuo account Resend).
 * - NEXTAUTH_URL / NEXT_PUBLIC_SITE_URL / VERCEL_URL: base URL pubblico del banner (`/email/prediction-master-header-banner.png` in `public/`).
 *   Su localhost il PNG viene allegato inline (CID) perché Gmail non segue URL locali.
 * - EMAIL_HEADER_IMAGE_URL: URL completo HTTPS del banner (override del path sotto `/public/email/`).
 * - EMAIL_HEADER_FORCE_CID_EMBED=1: forza il banner solo come allegato CID (anche con base URL HTTPS pubblico).
 */

import fs from "node:fs";
import path from "node:path";

import { getCanonicalBaseUrl } from "./canonical-base-url";

const RESEND_API = "https://api.resend.com/emails";

/** File in `public/email/` — URL assoluto costruito con `getCanonicalBaseUrl()` (HTTPS pubblico; su localhost usa CID allegato). */
const PM_TRANSACTIONAL_EMAIL_HEADER_IMAGE_PATH = "/email/prediction-master-header-banner.png";

const PM_EMAIL_HEADER_BANNER_CID = "pm-email-header-banner";

function transactionalEmailHeaderImageUrl(): string {
  const override = process.env.EMAIL_HEADER_IMAGE_URL?.trim();
  if (
    override &&
    (override.startsWith("https://") || override.startsWith("http://"))
  ) {
    return override;
  }
  return `${getCanonicalBaseUrl()}${PM_TRANSACTIONAL_EMAIL_HEADER_IMAGE_PATH}`;
}

function shouldEmbedTransactionalHeaderAsCid(imageUrl: string): boolean {
  if (process.env.EMAIL_HEADER_FORCE_CID_EMBED === "1") return true;
  try {
    const u = new URL(imageUrl);
    return u.hostname === "localhost" || u.hostname === "127.0.0.1";
  } catch {
    return false;
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeHtmlEmailHeaderImgSrc(raw: string): string {
  if (raw.startsWith("cid:")) {
    const id = raw.slice(4);
    if (/^[a-zA-Z0-9._-]{1,120}$/.test(id)) return `cid:${id}`;
    return escapeHtml(raw);
  }
  return escapeHtml(raw);
}

/**
 * `headerImageSrcResolved`: URL pubblico oppure `cid:…` se allegato inline in `sendEmail`.
 */
function wrapTransactionalEmailHtml(innerHtml: string, headerImageSrcResolved: string): string {
  const headerImgQuoted = escapeHtmlEmailHeaderImgSrc(headerImageSrcResolved);

  const cardBg =
    "linear-gradient(180deg,#111820 0%,#0c1016 52%,#080b0f 100%)";

  const brandStripe = `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0;border-collapse:collapse;">
      <tr>
        <td style="margin:0;padding:0;text-align:center;line-height:0;font-size:0;background:#05080c;border-radius:17px 17px 0 0;border-bottom:1px solid rgba(80,245,252,0.15);">
          <img src="${headerImgQuoted}" width="568" alt="PredictionMaster" style="display:block;width:100%;max-width:568px;height:auto;margin:0;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic;border-radius:17px 17px 0 0;">
        </td>
      </tr>
    </table>
  `.trim();

  const cardBody = `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0;border-collapse:collapse;">
      <tr>
        <td style="margin:0;padding:32px 28px 40px;background:${cardBg};border-radius:0 0 17px 17px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:17px;line-height:1.6;color:#e2e8f0;-webkit-font-smoothing:antialiased;">
          ${innerHtml}
        </td>
      </tr>
    </table>
  `.trim();

  const bodyBg =
    "radial-gradient(ellipse 140% 80% at 50% -20%,rgba(45,212,191,0.12) 0%,rgba(0,0,0,0) 55%),linear-gradient(172deg,#000204 0%,#061216 38%,#020608 72%,#000102 100%)";

  return `<!DOCTYPE html>
<html lang="it">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<meta name="color-scheme" content="dark" />
<meta name="supported-color-schemes" content="dark" />
</head>
<body style="margin:0;padding:0;background:${bodyBg};color:#e2e8f0;-webkit-font-smoothing:antialiased;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0;border-collapse:collapse;">
  <tr>
    <td align="center" style="padding:32px 16px 48px;">
      <table role="presentation" width="568" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:568px;margin:0 auto;border-collapse:collapse;border-radius:17px;overflow:hidden;box-shadow:0 28px 72px rgba(0,0,0,0.65),0 0 0 1px rgba(80,245,252,0.12);">
        <tr>
          <td style="padding:0;margin:0;">
            ${brandStripe}
            ${cardBody}
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>`;
}

interface ResendJsonAttachment {
  filename: string;
  content?: string;
  path?: string;
  content_id?: string;
}

function resolveTransactionalHeaderBannerForSend(): {
  headerImgSrcForHtml: string;
  cidAttachments?: ResendJsonAttachment[];
} {
  const remoteUrl = transactionalEmailHeaderImageUrl();
  if (!shouldEmbedTransactionalHeaderAsCid(remoteUrl)) {
    return { headerImgSrcForHtml: remoteUrl };
  }

  const filePath = path.join(process.cwd(), "public", "email", "prediction-master-header-banner.png");
  try {
    const content = fs.readFileSync(filePath).toString("base64");
    return {
      headerImgSrcForHtml: `cid:${PM_EMAIL_HEADER_BANNER_CID}`,
      cidAttachments: [
        {
          filename: "prediction-master-header-banner.png",
          content,
          content_id: PM_EMAIL_HEADER_BANNER_CID,
        },
      ],
    };
  } catch (e) {
    console.warn("[email] Impossibile embed CID banner locale, uso URL:", filePath, e);
    return { headerImgSrcForHtml: remoteUrl };
  }
}

/** Resend accetta onboarding@resend.dev solo come «sandbox»: consegna all'esterno bloccata. */
function usesResendSandboxSender(fromHeader: string): boolean {
  return /@resend\.dev\b/i.test(fromHeader);
}

const PRODUCTION_SANDBOX_ERROR =
  "Email non configurata per la produzione: in Vercel (o nell’host) imposta EMAIL_FROM con un mittente sul dominio verificato in Resend, es. PredictionMaster <noreply@tuodominio.it>. Il mittente onboarding@resend.dev consente solo recapito verso il tuo indirizzo di account.";

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Invia un'email. Usa Resend se RESEND_API_KEY è impostata.
 */
export async function sendEmail(options: SendEmailOptions): Promise<{ ok: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM ?? "Prediction Market <onboarding@resend.dev>";

  if (!apiKey) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[email] RESEND_API_KEY non impostata: email non inviata.", { to: options.to, subject: options.subject });
      return { ok: true }; // in dev non fallire
    }
    return { ok: false, error: "Servizio email non configurato" };
  }

  if (process.env.NODE_ENV === "production" && usesResendSandboxSender(from)) {
    console.error("[email] Produzione usa ancora un mittente @resend.dev. Imposta EMAIL_FROM sul dominio verificato.");
    return { ok: false, error: PRODUCTION_SANDBOX_ERROR };
  }

  try {
    const isFullDocument = /^[\s\r\n]*<!DOCTYPE/i.test(options.html);
    const banner = isFullDocument ? null : resolveTransactionalHeaderBannerForSend();
    const headerImgSrcForHtml = banner?.headerImgSrcForHtml ?? "";
    const cidAttachments = banner?.cidAttachments;

    const rawHtml = isFullDocument
      ? options.html
      : wrapTransactionalEmailHtml(options.html, headerImgSrcForHtml);

    const payload: Record<string, unknown> = {
      from,
      to: [options.to],
      subject: options.subject,
      html: rawHtml,
      text: options.text ?? undefined,
    };
    if (cidAttachments?.length) {
      payload.attachments = cidAttachments;
    }

    const res = await fetch(RESEND_API, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = (await res.json().catch(() => ({}))) as { id?: string; message?: string };
    if (!res.ok) {
      return { ok: false, error: data.message ?? `HTTP ${res.status}` };
    }
    return { ok: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Errore invio email";
    return { ok: false, error: message };
  }
}

/** Dominio pubblico (footer solo testuale multipart). */
const PM_SIGNATURE_SITE_HOST = "predictionmaster.it";

/** Chiusura multipart (nessun marchio nell’HTML: solo questo + corpo nei template testo). */
function emailPlainFooter(): string {
  return `---\n${PM_SIGNATURE_SITE_HOST}`;
}

export interface PasswordResetEmailPayload {
  code: string;
}

/**
 * Email recupero password — solo codice OTP (nessun link necessario).
 */
export async function sendPasswordResetEmail(
  to: string,
  payload: PasswordResetEmailPayload
): Promise<{ ok: boolean; error?: string }> {
  const { code } = payload;
  const subject = "Reset password - Prediction Master";
  const html = `
    <p>Ciao,</p>
    <p>Hai richiesto di reimpostare la password del tuo account Prediction Master.</p>
    <p>Inserisci questo codice nella piattaforma per continuare:</p>
    <p style="font-size:28px;font-weight:bold;letter-spacing:0.2em">${escapeHtml(code)}</p>
    <p>Il codice è valido per 10 minuti.</p>
    <p>Se non hai richiesto questa operazione, ignora questa email. La tua password rimarrà invariata.</p>
  `;
  const text = [
    "Ciao,",
    "",
    "Hai richiesto di reimpostare la password del tuo account Prediction Master.",
    "",
    "Inserisci questo codice nella piattaforma per continuare:",
    "",
    code,
    "",
    "Il codice è valido per 10 minuti.",
    "",
    "Se non hai richiesto questa operazione, ignora questa email. La tua password rimarrà invariata.",
    "",
    emailPlainFooter(),
  ].join("\n");
  return sendEmail({ to, subject, html, text });
}

export interface VerificationEmailPayload {
  code: string;
}

/**
 * Email di verifica alla registrazione.
 * Per cambiare soggetto e testo: modifica `subject`, `html` e `text` qui sotto.
 */
export async function sendVerificationEmail(
  to: string,
  payload: VerificationEmailPayload
): Promise<{ ok: boolean; error?: string }> {
  const { code } = payload;
  const subject = "Completa la registrazione — PredictionMaster";
  const html = `
    <p>Ciao!</p>
    <p>Benvenuto su PredictionMaster, la piattaforma dove le tue previsioni sul calcio diventano sfide.</p>
    <p>Per completare la registrazione e iniziare a giocare, inserisci questo codice:</p>
    <p style="font-size:28px;font-weight:bold;letter-spacing:0.2em">${escapeHtml(code)}</p>
    <p>Se non hai richiesto questa registrazione, ignora questa email.</p>
    <p>Ci vediamo in campo,<br/>Il Team di Prediction Master</p>
  `;
  const text = [
    "Ciao!",
    "",
    "Benvenuto su PredictionMaster, la piattaforma dove le tue previsioni sul calcio diventano sfide.",
    "",
    "Per completare la registrazione e iniziare a giocare, inserisci questo codice:",
    "",
    code,
    "",
    "Se non hai richiesto questa registrazione, ignora questa email.",
    "",
    "Ci vediamo in campo,",
    "Il Team di Prediction Master",
    "",
    emailPlainFooter(),
  ].join("\n");
  return sendEmail({ to, subject, html, text });
}

/** Dopo verifica email (prima volta) o dopo prima registrazione OAuth (es. Google). */
export type WelcomeEmailReason = "email_verification" | "oauth_google";

export async function sendWelcomeEmail(
  to: string,
  _displayName?: string | null,
  _options?: { reason?: WelcomeEmailReason }
) {
  const subject = "Benvenuto su Prediction Master";
  const html = `
    <p>Ciao!</p>
    <p>Benvenuto su Prediction Master, la piattaforma dove le tue previsioni sul calcio diventano sfide.</p>
    <p>Ci vediamo in campo,<br/>Il Team di Prediction Master</p>
    <p style="margin-top:28px;padding-top:22px;border-top:1px solid rgba(148,163,184,0.28);color:rgba(203,213,225,0.92);font-size:14px;line-height:1.65">
      ---<br/><br/>
      Prediction Master<br/>
      predictionmaster.it
    </p>
  `;
  const text = [
    "Ciao!",
    "",
    "Benvenuto su Prediction Master, la piattaforma dove le tue previsioni sul calcio diventano sfide.",
    "",
    "Ci vediamo in campo,",
    "Il Team di Prediction Master",
    "",
    "---",
    "",
    "Prediction Master",
    "predictionmaster.it",
  ].join("\n");
  return sendEmail({ to, subject, html, text });
}

export async function sendEventCreatedCongratulationsEmail(to: string, eventTitle: string, eventUrl: string) {
  const subject = "Il tuo evento è online - Prediction Market";
  const html = `
    <p>Ciao,</p>
    <p>Complimenti: il tuo evento <strong>${escapeHtml(eventTitle)}</strong> è stato pubblicato.</p>
    <p><a href="${escapeHtml(eventUrl)}">Apri il mercato</a></p>
    <p>Grazie per aver contribuito alla community,<br/>— Prediction Market</p>
  `;
  const text = [
    `Complimenti: "${eventTitle}" è online.`,
    "",
    eventUrl,
    "",
    emailPlainFooter(),
  ].join("\n");
  return sendEmail({ to, subject, html, text });
}

export async function sendEventExpiryResolutionReminderEmail(
  to: string,
  eventTitle: string,
  eventUrl: string,
  closesAtLabel: string
) {
  const short = eventTitle.length > 55 ? `${eventTitle.slice(0, 55)}…` : eventTitle;
  const subject = `Il tuo mercato sta per chiudere — ${short}`;
  const titleHtml = escapeHtml(eventTitle.length > 100 ? `${eventTitle.slice(0, 100)}…` : eventTitle);
  const html = `
    <p>Ciao,</p>
    <p>Hai creato il mercato <strong>${titleHtml}</strong>.</p>
    <p><strong>Chiusura prevista:</strong> ${escapeHtml(closesAtLabel)}</p>
    <p>Quando sarà il momento, servirà l’esito (Sì/No o risoluzione secondo le regole del mercato). Puoi gestire tutto dall’area evento:</p>
    <p><a href="${escapeHtml(eventUrl)}">Vai all’evento</a></p>
    <p>— Prediction Market</p>
  `;
  const text = [
    `"${eventTitle}" chiude (${closesAtLabel}).`,
    "",
    `Gestisci l’esito qui:`,
    eventUrl,
    "",
    emailPlainFooter(),
  ].join("\n");
  return sendEmail({ to, subject, html, text });
}

