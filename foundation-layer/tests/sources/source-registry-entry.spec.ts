import { describe, expect, it } from "vitest";
import {
  AuthenticationMode,
  SourceHealthStatus,
  createAuditMetadata,
  createSourceDefinitionId,
  createSourceRegistryEntry,
  createTimestamp,
  validateSourceRegistryEntry,
} from "@/index.js";

const createValidRegistryEntry = () =>
  createSourceRegistryEntry({
    sourceDefinitionId: createSourceDefinitionId("sdef_abcdefg"),
    pollingPolicyNullable: null,
    rateLimitProfileNullable: null,
    authenticationMode: AuthenticationMode.API_KEY,
    healthStatus: SourceHealthStatus.HEALTHY,
    ownerNotesNullable: "owned by ingestion team",
    auditMetadata: createAuditMetadata({
      createdBy: "system",
      createdAt: createTimestamp("2026-03-01T00:00:00.000Z"),
      updatedBy: "system",
      updatedAt: createTimestamp("2026-03-01T00:00:00.000Z"),
    }),
  });

describe("source registry entry", () => {
  it("validates a correct source registry entry", () => {
    const report = validateSourceRegistryEntry(createValidRegistryEntry());
    expect(report.isValid).toBe(true);
  });

  it("rejects invalid authentication mode", () => {
    const payload = {
      ...createValidRegistryEntry(),
      authenticationMode: "TOKEN",
    };
    const report = validateSourceRegistryEntry(payload as never);
    expect(report.isValid).toBe(false);
    expect(report.issues.map((issue) => issue.code)).toContain("INVALID_ENUM");
  });

  it("rejects missing audit metadata", () => {
    const payload = {
      ...createValidRegistryEntry(),
      auditMetadata: null,
    };
    const report = validateSourceRegistryEntry(payload as never);
    expect(report.isValid).toBe(false);
    expect(report.issues.map((issue) => issue.code)).toContain("SCHEMA_TYPE");
  });

  it("rejects invalid sourceDefinitionId format", () => {
    const payload = {
      ...createValidRegistryEntry(),
      sourceDefinitionId: "src_abcdefg",
    };
    const report = validateSourceRegistryEntry(payload as never);
    expect(report.isValid).toBe(false);
    expect(report.issues.map((issue) => issue.code)).toContain("PATTERN_MISMATCH");
  });
});
