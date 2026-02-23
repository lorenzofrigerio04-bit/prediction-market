import type { PrismaClient, Prisma } from "@prisma/client";

type Tx = Omit<
  Prisma.TransactionClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use"
>;

/**
 * Ensures an AmmState row exists for the event when tradingMode is AMM.
 * Idempotent: no-op if AmmState already exists or event is not AMM.
 */
export async function ensureAmmStateForEvent(
  prismaOrTx: PrismaClient | Tx,
  eventId: string
): Promise<void> {
  const event = await prismaOrTx.event.findUnique({
    where: { id: eventId },
    select: { tradingMode: true, b: true, ammState: { select: { id: true } } },
  });
  if (!event || event.tradingMode !== "AMM") return;
  if (event.ammState) return;

  const bMicros = BigInt(Math.round((event.b ?? 100) * 1_000_000));
  await prismaOrTx.ammState.create({
    data: {
      eventId,
      qYesMicros: 0n,
      qNoMicros: 0n,
      bMicros,
    },
  });
}
