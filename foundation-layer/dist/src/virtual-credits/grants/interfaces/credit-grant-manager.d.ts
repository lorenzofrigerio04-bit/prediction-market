import type { Timestamp } from "../../../value-objects/timestamp.vo.js";
import type { CreditGrant } from "../entities/credit-grant.entity.js";
import type { CreditGrantId, VirtualCreditAccountId } from "../../value-objects/index.js";
export interface CreditGrantManager {
    createGrant(grant: CreditGrant): CreditGrant;
    activateGrant(grantId: CreditGrantId): CreditGrant | null;
    expireGrant(grantId: CreditGrantId, at: Timestamp): CreditGrant | null;
    revokeGrant(grantId: CreditGrantId, reason: string): CreditGrant | null;
    listGrantsForAccount(accountId: VirtualCreditAccountId): readonly CreditGrant[];
}
//# sourceMappingURL=credit-grant-manager.d.ts.map