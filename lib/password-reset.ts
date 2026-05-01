import { randomBytes, randomInt } from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/email";

export const PASSWORD_RESET_IDENTIFIER_PREFIX = "password-reset:" as const;

export const PASSWORD_RESET_EXPIRY_MS = 10 * 60 * 1000;

function normalizeEmailKey(email: string): string {
  return email.trim().toLowerCase();
}

export function passwordResetIdentifier(email: string): string {
  return `${PASSWORD_RESET_IDENTIFIER_PREFIX}${normalizeEmailKey(email)}`;
}

export function generatePasswordResetOpaqueToken(): string {
  return randomBytes(32).toString("hex");
}

export function generatePasswordResetSixDigitCode(): string {
  return randomInt(100000, 1000000).toString();
}

export type RequestPasswordResetResult =
  | { ok: true; attemptedSend: boolean; emailError?: string }
  | { ok: false; error: string };

/**
 * Crea token OTP e invia email solo se esiste un utente con password (account email/password).
 * Risposta sempre generica lato sicurezza: non rivela se l’email esiste.
 */
export async function createAndSendPasswordResetCode(
  emailRaw: string
): Promise<RequestPasswordResetResult> {
  const email = emailRaw.trim();
  if (!email) {
    return { ok: false, error: "Email mancante" };
  }

  const user = await prisma.user.findFirst({
    where: { email: { equals: email, mode: "insensitive" } },
    select: { id: true, email: true, password: true },
  });

  if (!user?.email || !user.password) {
    return { ok: true, attemptedSend: false };
  }

  const identifier = passwordResetIdentifier(user.email);
  await prisma.verificationToken.deleteMany({ where: { identifier } });

  const token = generatePasswordResetOpaqueToken();
  const otpCode = generatePasswordResetSixDigitCode();
  const expires = new Date(Date.now() + PASSWORD_RESET_EXPIRY_MS);

  await prisma.verificationToken.create({
    data: {
      token,
      identifier,
      expires,
      otpCode,
      pendingPasswordHash: null,
      pendingName: null,
    },
  });

  const send = await sendPasswordResetEmail(user.email, { code: otpCode });
  if (!send.ok) {
    await prisma.verificationToken.deleteMany({ where: { token } }).catch(() => {});
    return {
      ok: true,
      attemptedSend: true,
      emailError:
        send.error ?? "Non siamo riusciti a inviare l’email. Riprova tra un attimo.",
    };
  }

  return { ok: true, attemptedSend: true };
}

export type ResetPasswordWithCodeResult =
  | { ok: true }
  | { ok: false; error: "not_found" | "weak_password" | "server" };

/**
 * Verifica codice a 6 cifre, imposta nuova password, elimina token e tutte le sessioni utente.
 */
export async function resetPasswordWithOtpCode(
  emailRaw: string,
  codeInput: string,
  newPassword: string
): Promise<ResetPasswordWithCodeResult> {
  const email = emailRaw.trim();
  const code = codeInput.replace(/\D/g, "").trim();
  if (!email || code.length !== 6) {
    return { ok: false, error: "not_found" };
  }
  if (newPassword.length < 6) {
    return { ok: false, error: "weak_password" };
  }

  const user = await prisma.user.findFirst({
    where: { email: { equals: email, mode: "insensitive" } },
    select: { id: true, email: true },
  });
  if (!user?.email) {
    return { ok: false, error: "not_found" };
  }

  const identifier = passwordResetIdentifier(user.email);
  const record = await prisma.verificationToken.findFirst({
    where: {
      identifier,
      otpCode: code,
      expires: { gt: new Date() },
    },
  });

  if (!record) {
    return { ok: false, error: "not_found" };
  }

  const hashed = await bcrypt.hash(newPassword, 10);

  try {
    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { password: hashed },
      }),
      prisma.verificationToken.deleteMany({ where: { token: record.token } }),
      prisma.session.deleteMany({ where: { userId: user.id } }),
    ]);
    return { ok: true };
  } catch (e) {
    console.error("[password-reset]", e);
    return { ok: false, error: "server" };
  }
}
