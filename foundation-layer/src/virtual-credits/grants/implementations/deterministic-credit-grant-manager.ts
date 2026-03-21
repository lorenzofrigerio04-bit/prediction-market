import type { Timestamp } from "../../../value-objects/timestamp.vo.js";
import { GrantStatus } from "../../enums/grant-status.enum.js";
import type { CreditGrantId, VirtualCreditAccountId } from "../../value-objects/index.js";
import type { CreditGrant } from "../entities/credit-grant.entity.js";
import type { CreditGrantManager } from "../interfaces/credit-grant-manager.js";

export class DeterministicCreditGrantManager implements CreditGrantManager {
  private readonly byId = new Map<CreditGrantId, CreditGrant>();

  createGrant(grant: CreditGrant): CreditGrant {
    this.byId.set(grant.id, grant);
    return grant;
  }

  activateGrant(grantId: CreditGrantId): CreditGrant | null {
    const existing = this.byId.get(grantId);
    if (existing === undefined) {
      return null;
    }
    const updated: CreditGrant = { ...existing, grant_status: GrantStatus.ACTIVE };
    this.byId.set(grantId, updated);
    return updated;
  }

  expireGrant(grantId: CreditGrantId, at: Timestamp): CreditGrant | null {
    const existing = this.byId.get(grantId);
    if (existing === undefined) {
      return null;
    }
    const updated: CreditGrant = { ...existing, grant_status: GrantStatus.EXPIRED, expiration_nullable: at };
    this.byId.set(grantId, updated);
    return updated;
  }

  revokeGrant(grantId: CreditGrantId): CreditGrant | null {
    const existing = this.byId.get(grantId);
    if (existing === undefined) {
      return null;
    }
    const updated: CreditGrant = { ...existing, grant_status: GrantStatus.REVOKED };
    this.byId.set(grantId, updated);
    return updated;
  }

  listGrantsForAccount(accountId: VirtualCreditAccountId): readonly CreditGrant[] {
    return [...this.byId.values()].filter((grant) => grant.target_account_id === accountId);
  }
}
