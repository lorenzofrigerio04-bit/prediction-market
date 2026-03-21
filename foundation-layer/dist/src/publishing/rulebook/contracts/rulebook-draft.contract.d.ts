/**
 * Official publishing-layer contract for rulebook draft compatibility.
 *
 * Foundation layer currently does not expose a standalone RulebookDraft model.
 * This contract provides a centralized, stable shape used by publishing adapters
 * without introducing breaking changes in existing modules.
 */
export type RulebookDraftContract = Readonly<{
    title: string;
    closesAt: string;
    resolutionSourceUrl: string | null;
    resolutionCriteriaYes: string | null;
    resolutionCriteriaNo: string | null;
    timezone: string | null;
    resolutionSourceSecondary: string | null;
    resolutionSourceTertiary: string | null;
}>;
//# sourceMappingURL=rulebook-draft.contract.d.ts.map