import type { Branded } from "../../common/types/branded.js";
export type DisplayLabel = Branded<string, "DisplayLabel">;
export type SemanticDefinition = Branded<string, "SemanticDefinition">;
export type ValidationNote = Branded<string, "ValidationNote">;
export type CompatibilityNote = Branded<string, "CompatibilityNote">;
export type TriggerPolicyNote = Branded<string, "TriggerPolicyNote">;
export declare const createDisplayLabel: (value: string) => DisplayLabel;
export declare const createSemanticDefinition: (value: string) => SemanticDefinition;
export declare const createValidationNote: (value: string) => ValidationNote;
export declare const createCompatibilityNote: (value: string) => CompatibilityNote;
export declare const createTriggerPolicyNote: (value: string) => TriggerPolicyNote;
//# sourceMappingURL=frontier-text.vo.d.ts.map