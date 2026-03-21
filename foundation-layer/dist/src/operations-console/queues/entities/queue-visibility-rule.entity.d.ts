import { VisibilityStatus } from "../../enums/visibility-status.enum.js";
export type QueueVisibilityRule = Readonly<{
    permission_key: string;
    expected_visibility: VisibilityStatus;
}>;
export declare const createQueueVisibilityRule: (input: QueueVisibilityRule) => QueueVisibilityRule;
//# sourceMappingURL=queue-visibility-rule.entity.d.ts.map