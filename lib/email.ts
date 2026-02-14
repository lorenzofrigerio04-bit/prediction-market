/**
 * Invio email (verifica account, ecc.).
 * Supporta Resend (consigliato) via API key.
 *
 * Variabili d'ambiente:
 * - RESEND_API_KEY: API key da https://resend.com/api-keys
 * - EMAIL_FROM: mittente (es. "Prediction Market <onboarding@resend.dev>" o il tuo dominio verificato)
 */

const RESEND_API = "https://api.resend.com/emails";

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

  try {
    const res = await fetch(RESEND_API, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [options.to],
        subject: options.subject,
        html: options.html,
        text: options.text ?? undefined,
      }),
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

const VERIFY_EMAIL_SUBJECT = "Verifica il tuo indirizzo email – Prediction Market";

/**
 * Invia l'email di verifica con il link al token.
 */
export async function sendVerificationEmail(email: string, verifyUrl: string): Promise<{ ok: boolean; error?: string }> {
  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: system-ui, sans-serif; line-height: 1.6; color: #333; max-width: 480px; margin: 0 auto; padding: 24px;">
  <h1 style="font-size: 1.25rem;">Verifica la tua email</h1>
  <p>Clicca il pulsante qui sotto per confermare che questo indirizzo è tuo. Il link scade tra 24 ore.</p>
  <p style="margin: 24px 0;">
    <a href="${verifyUrl}" style="display: inline-block; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">Verifica email</a>
  </p>
  <p style="color: #666; font-size: 0.875rem;">Se non hai richiesto tu questa email, puoi ignorarla.</p>
</body>
</html>
  `.trim();

  return sendEmail({
    to: email,
    subject: VERIFY_EMAIL_SUBJECT,
    html,
    text: `Verifica la tua email: ${verifyUrl}`,
  });
}
