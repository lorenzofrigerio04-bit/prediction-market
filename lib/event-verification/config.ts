/**
 * Configurazione per il modulo di verifica: domini whitelist/blacklist da env o file.
 *
 * Env:
 *   EVENT_VERIFICATION_DOMAIN_BLACKLIST  – comma-separated hostnames
 *   EVENT_VERIFICATION_DOMAIN_WHITELIST  – comma-separated (se vuoto, tutti i domini non blacklisted)
 *   EVENT_VERIFICATION_DOMAINS_FILE      – path a file JSON con { "whitelist": [], "blacklist": [] }
 *
 * File (opzionale): JSON con chiavi "whitelist" e "blacklist" (array di stringhe).
 * Se il file è presente, i valori dal file vengono usati (env può estendere se si vuole; qui: file ha priorità per semplicità).
 */

import type { VerificationConfig } from "./types";
import {
  DEFAULT_VAGUE_KEYWORDS,
  DEFAULT_NON_BINARY_KEYWORDS,
} from "./criteria";

/** Default configurazione verifica. */
export const DEFAULT_VERIFICATION_CONFIG: VerificationConfig = {
  domainWhitelist: [],
  domainBlacklist: [
    "example.com",
    "test.com",
    "localhost",
    "clickbait.example",
    "clickbait.example.com",
  ],
  minTitleLength: 15,
  maxTitleLength: 200,
  vagueKeywords: DEFAULT_VAGUE_KEYWORDS,
  nonBinaryKeywords: DEFAULT_NON_BINARY_KEYWORDS,
  filterByScore: true,
  minVerificationScore: 0.25,
};

function parseListFromEnv(envValue: string | undefined): string[] {
  if (!envValue || typeof envValue !== "string") return [];
  return envValue
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

function loadDomainsFromFile(filePath: string): { whitelist: string[]; blacklist: string[] } {
  try {
    const fs = require("fs");
    const path = require("path");
    const resolved = path.isAbsolute(filePath) ? filePath : path.resolve(process.cwd(), filePath);
    if (!fs.existsSync(resolved)) return { whitelist: [], blacklist: [] };
    const raw = fs.readFileSync(resolved, "utf8");
    const data = JSON.parse(raw) as { whitelist?: string[]; blacklist?: string[] };
    return {
      whitelist: Array.isArray(data.whitelist) ? data.whitelist.map((s) => String(s).trim().toLowerCase()).filter(Boolean) : [],
      blacklist: Array.isArray(data.blacklist) ? data.blacklist.map((s) => String(s).trim().toLowerCase()).filter(Boolean) : [],
    };
  } catch {
    return { whitelist: [], blacklist: [] };
  }
}

/**
 * Carica la configurazione di verifica da env (e opzionalmente da file).
 * Ordine: default → env → file (il file sovrascrive env per whitelist/blacklist).
 */
export function getVerificationConfigFromEnv(overrides?: Partial<VerificationConfig>): VerificationConfig {
  const domainsFile = process.env.EVENT_VERIFICATION_DOMAINS_FILE?.trim();
  let domainWhitelist = parseListFromEnv(process.env.EVENT_VERIFICATION_DOMAIN_WHITELIST);
  let domainBlacklist = parseListFromEnv(process.env.EVENT_VERIFICATION_DOMAIN_BLACKLIST);

  if (domainsFile) {
    const fromFile = loadDomainsFromFile(domainsFile);
    if (fromFile.whitelist.length > 0) domainWhitelist = fromFile.whitelist;
    if (fromFile.blacklist.length > 0) domainBlacklist = fromFile.blacklist;
  }

  if (domainWhitelist.length === 0)
    domainWhitelist = [...DEFAULT_VERIFICATION_CONFIG.domainWhitelist];
  if (domainBlacklist.length === 0)
    domainBlacklist = [...DEFAULT_VERIFICATION_CONFIG.domainBlacklist];

  const minTitleLength =
    parseInt(process.env.EVENT_VERIFICATION_MIN_TITLE_LENGTH ?? "", 10) ||
    DEFAULT_VERIFICATION_CONFIG.minTitleLength;
  const maxTitleLength =
    parseInt(process.env.EVENT_VERIFICATION_MAX_TITLE_LENGTH ?? "", 10) ||
    DEFAULT_VERIFICATION_CONFIG.maxTitleLength;
  const filterByScore =
    process.env.EVENT_VERIFICATION_FILTER_BY_SCORE !== "0" &&
    process.env.EVENT_VERIFICATION_FILTER_BY_SCORE !== "false";
  const minVerificationScore =
    parseFloat(process.env.EVENT_VERIFICATION_MIN_SCORE ?? "") ||
    DEFAULT_VERIFICATION_CONFIG.minVerificationScore;

  return {
    ...DEFAULT_VERIFICATION_CONFIG,
    domainWhitelist,
    domainBlacklist,
    minTitleLength,
    maxTitleLength,
    filterByScore,
    minVerificationScore,
    ...overrides,
  };
}
