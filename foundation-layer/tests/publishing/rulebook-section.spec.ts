import { describe, expect, it } from "vitest";
import { RulebookSectionType } from "@/publishing/enums/rulebook-section-type.enum.js";
import { createRulebookSection } from "@/publishing/rulebook/entities/rulebook-section.entity.js";
import { createRulebookSectionId } from "@/publishing/value-objects/publishing-ids.vo.js";
import { validateRulebookSection } from "@/publishing/validators/validate-rulebook-section.js";

describe("RulebookSection", () => {
  it("accepts a valid section", () => {
    const section = createRulebookSection({
      id: createRulebookSectionId("rbsec_validsect01"),
      section_type: RulebookSectionType.CANONICAL_QUESTION,
      title: "Canonical Question",
      body: "Will the event occur by the stated deadline?",
      ordering_index: 0,
      required: true,
    });
    expect(validateRulebookSection(section).isValid).toBe(true);
  });

  it("rejects whitespace-only body", () => {
    expect(() =>
      createRulebookSection({
        id: createRulebookSectionId("rbsec_invalid001"),
        section_type: RulebookSectionType.CANONICAL_QUESTION,
        title: "Canonical Question",
        body: "  ",
        ordering_index: 0,
        required: true,
      }),
    ).toThrow();
  });
});
