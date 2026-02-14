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

