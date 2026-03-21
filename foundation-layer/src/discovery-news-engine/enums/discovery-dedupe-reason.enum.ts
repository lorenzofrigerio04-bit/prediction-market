export enum DiscoveryDedupeReason {
  EXACT_MATCH = "exact_match",
  CANONICAL_MATCH = "canonical_match",
  SOURCE_EXTERNAL_ID = "source_external_id",
  SYNTHETIC_LOCATOR = "synthetic_locator",
  TITLE_TIME_WINDOW = "title_time_window",
  TIME_OVERLAP = "time_overlap",
  MANUAL = "manual",
}
