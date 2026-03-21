export enum DiscoveryDedupeOutcome {
  UNIQUE = "unique",
  DUPLICATE_WITHIN_RUN = "duplicate_within_run",
  DUPLICATE_OF_EXISTING = "duplicate_of_existing",
  INSUFFICIENT_EVIDENCE = "insufficient_evidence",
  NOT_DEDUPLICATED = "not_deduplicated",
}
