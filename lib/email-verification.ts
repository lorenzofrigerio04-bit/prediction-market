import { randomBytes, randomInt } from "crypto";
import { prisma } from "@/lib/prisma";
import { sendVerificationEmail } from "@/lib/email";
import { CREDITS_SCALE, INITIAL_CREDITS } from "@/lib/credits-config";

export const VERIFY_EXPIRY_HOURS = 24;

export function generateVerificationOpaqueToken(): string {
  return randomBytes(32).toString("hex");
}

export function generateVerificationSixDigitCode(): string {
  return randomInt(100000, 1000000).toString();
}

class VerificationConflictError extends Error {
  constructor(msg: string) {
    super(msg);
    this.name = "VerificationConflictError";
  }
}

export type CreateVerificationEmailOptions = {
  pendingPasswordHash?: string;
  pendingName?: string | null;
};

/**
 * Persiste nuovo token + codice e invia email. Invalida tutti i token precedenti per la stessa identifier.
 */
export async function createAndSendVerificationEmail(
  emailRaw: string,
  options?: CreateVerificationEmailOptions
): Promise<{ ok: boolean; error?: string }> {
  const email = emailRaw.trim();
  if (!email) {
    return { ok: false, error: "Email mancante" };
  }

  await prisma.verificationToken.deleteMany({ where: { identifier: email } });

  const token = generateVerificationOpaqueToken();
  const otpCode = generateVerificationSixDigitCode();
  const expires = new Date(Date.now() + VERIFY_EXPIRY_HOURS * 60 * 60 * 1000);

  await prisma.verificationToken.create({
    data: {
      token,
      identifier: email,
      expires,
      otpCode,
      pendingPasswordHash: options?.pendingPasswordHash ?? null,
      pendingName: options?.pendingName ?? null,
    },
  });

  return sendVerificationEmail(email, { code: otpCode });
}

async function findUserForVerificationIdentifier(identifier: string) {
  return prisma.user.findFirst({
    where: { email: { equals: identifier.trim(), mode: "insensitive" } },
    select: { id: true, email: true, emailVerified: true },
  });
}

type PendingRecord = {
  identifier: string;
  pendingPasswordHash: string;
  pendingName: string | null;
  token: string;
};

/**
 * Crea `User` al termine del flusso registrazione (password hash su verification token prima della verifica).
 */
async function finalizePendingSignupFromRecord(
  record: PendingRecord
): Promise<
  { ok: false; reason: "not_found" } | { ok: true; email: string; userId: string; wasFreshVerification: true }
> {
  const emailKey = record.identifier.trim();
  if (!emailKey || !record.pendingPasswordHash) {
    return { ok: false, reason: "not_found" };
  }

  try {
    const user = await prisma.$transaction(async (tx) => {
      const dup = await tx.user.findFirst({
        where: { email: { equals: emailKey, mode: "insensitive" } },
        select: { id: true, emailVerified: true },
      });

      if (dup?.emailVerified) {
        throw new VerificationConflictError("already_verified");
      }

      if (dup?.id && !dup.emailVerified) {
        const oauthLinks = await tx.account.count({ where: { userId: dup.id } });
        if (oauthLinks > 0) {
          throw new VerificationConflictError("oauth_unverified");
        }
        await tx.user.delete({ where: { id: dup.id } });
      }

      const created = await tx.user.create({
        data: {
          email: emailKey,
          name: record.pendingName,
          password: record.pendingPasswordHash,
          emailVerified: new Date(),
          credits: INITIAL_CREDITS,
          creditsMicros: BigInt(INITIAL_CREDITS) * BigInt(CREDITS_SCALE),
        },
        select: { id: true, email: true },
      });

      await tx.verificationToken.deleteMany({ where: { token: record.token } });
      return created;
    });

    return {
      ok: true,
      email: user.email ?? emailKey,
      userId: user.id,
      wasFreshVerification: true,
    };
  } catch (e) {
    if (e instanceof VerificationConflictError) {
      await prisma.verificationToken.deleteMany({ where: { token: record.token } }).catch(() => {});
      return { ok: false, reason: "not_found" };
    }
    throw e;
  }
}

export type VerificationCompletionResult =
  | { ok: false; reason: "not_found" | "expired" }
  | {
      ok: true;
      email: string;
      wasFreshVerification: boolean;
      userId?: string;
    };

/**
 * Verifica con token da URL, marca email verificata o completa registrazione pending, elimina il token.
 */
export async function verifyEmailWithUrlToken(tokenInput: string): Promise<VerificationCompletionResult> {
  const token = tokenInput.trim();
  if (!token) {
    return { ok: false, reason: "not_found" };
  }

  const record = await prisma.verificationToken.findUnique({
    where: { token },
  });

  if (!record || record.expires < new Date()) {
    await prisma.verificationToken.deleteMany({ where: { token } }).catch(() => {});
    return { ok: false, reason: "expired" };
  }

  if (record.pendingPasswordHash) {
    const fin = await finalizePendingSignupFromRecord({
      identifier: record.identifier,
      pendingPasswordHash: record.pendingPasswordHash,
      pendingName: record.pendingName,
      token: record.token,
    });
    if (!fin.ok) {
      return { ok: false, reason: "not_found" };
    }
    return {
      ok: true,
      email: fin.email,
      wasFreshVerification: fin.wasFreshVerification,
      userId: fin.userId,
    };
  }

  const user = await findUserForVerificationIdentifier(record.identifier);
  if (!user?.email) {
    await prisma.verificationToken.deleteMany({ where: { token } }).catch(() => {});
    return { ok: false, reason: "not_found" };
  }

  const wasFresh = !user.emailVerified;

  await prisma.user.update({
    where: { id: user.id },
    data: { emailVerified: new Date() },
  });
  await prisma.verificationToken.deleteMany({ where: { token } }).catch(() => {});

  return {
    ok: true,
    email: user.email,
    wasFreshVerification: wasFresh,
  };
}

/**
 * Verifica con email + codice a 6 cifre.
 */
export async function verifyEmailWithCode(
  emailInput: string,
  codeInput: string
): Promise<VerificationCompletionResult> {
  const email = emailInput.trim();
  const code = codeInput.replace(/\D/g, "").trim();
  if (!email || code.length !== 6) {
    return { ok: false, reason: "not_found" };
  }

  const record = await prisma.verificationToken.findFirst({
    where: {
      identifier: { equals: email, mode: "insensitive" },
      otpCode: code,
      expires: { gt: new Date() },
    },
  });

  if (!record) {
    return { ok: false, reason: "not_found" };
  }

  if (record.pendingPasswordHash) {
    const fin = await finalizePendingSignupFromRecord({
      identifier: record.identifier,
      pendingPasswordHash: record.pendingPasswordHash,
      pendingName: record.pendingName,
      token: record.token,
    });
    if (!fin.ok) {
      return { ok: false, reason: "not_found" };
    }
    return {
      ok: true,
      email: fin.email,
      wasFreshVerification: fin.wasFreshVerification,
      userId: fin.userId,
    };
  }

  const user = await findUserForVerificationIdentifier(record.identifier);
  if (!user?.email) {
    await prisma.verificationToken.deleteMany({ where: { token: record.token } }).catch(() => {});
    return { ok: false, reason: "not_found" };
  }

  const wasFresh = !user.emailVerified;

  await prisma.user.update({
    where: { id: user.id },
    data: { emailVerified: new Date() },
  });
  await prisma.verificationToken.deleteMany({ where: { token: record.token } }).catch(() => {});

  return {
    ok: true,
    email: user.email,
    wasFreshVerification: wasFresh,
  };
}
