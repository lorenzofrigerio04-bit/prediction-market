import { IdentifierKind } from "../enums/identifier-kind.enum.js";
export type SourceBaseIdentifier = Readonly<{
    kind: IdentifierKind;
    value: string;
}>;
export declare const createSourceBaseIdentifier: (kind: IdentifierKind, value: string) => SourceBaseIdentifier;
//# sourceMappingURL=source-base-identifier.vo.d.ts.map