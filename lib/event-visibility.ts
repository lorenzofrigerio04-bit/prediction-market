import type { Prisma } from "@prisma/client";

/**
 * Condizione Prisma per eventi visibili in Home, Esplora e feed pubblici.
 * Mostra tutti gli eventi tranne quelli con sourceType = 'HIDDEN' (eliminati dalla piattaforma).
 * Così gli eventi generati dalla pipeline (NEWS o con creation_metadata) compaiono sempre.
 */
export const PUBLIC_EVENT_VISIBILITY: Prisma.EventWhereInput = {
  OR: [
    { sourceType: null },
    { sourceType: { not: "HIDDEN" } },
  ],
};

/**
 * Solo eventi da feed notizie (Home): sourceType null o NEWS.
 * Gli eventi sport (sourceType=SPORT) non devono mai comparire in homepage; sono solo in /sport.
 */
export const HOME_FEED_SOURCE_TYPE: Prisma.EventWhereInput = {
  OR: [{ sourceType: null }, { sourceType: "NEWS" }],
};
