import type { Timestamp } from "../../../value-objects/timestamp.vo.js";
import type { CreditGrantId, VirtualCreditAccountId } from "../../value-objects/index.js";
import type { CreditGrant } from "../entities/credit-grant.entity.js";
import type { CreditGrantManager } from "../interfaces/credit-grant-manager.js";
export declare class DeterministicCreditGrantManager implements CreditGrantManager {
    private readonly byId;
    createGrant(grant: CreditGrant): CreditGrant;
    activateGrant(grantId: CreditGrantId): CreditGrant | null;
    expireGrant(grantId: CreditGrantId, at: Timestamp): CreditGrant | null;
    revokeGrant(grantId: CreditGrantId): CreditGrant | null;
    listGrantsForAccount(accountId: VirtualCreditAccountId): readonly CreditGrant[];
}
//# sourceMappingURL=deterministic-credit-grant-manager.d.ts.map