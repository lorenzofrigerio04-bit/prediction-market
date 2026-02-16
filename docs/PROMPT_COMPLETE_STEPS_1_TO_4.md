# Agent Mode Prompt: Complete Steps 1-4 Before Step 5

Copy this entire prompt into a new Agent Mode chat to ensure everything before Step 5 is fully implemented and verified.

---

## Context

We're upgrading a prediction market platform. The plan is in `.cursor/plans/italy-first_binary_prediction_market_upgrade_2b809a99.plan.md`. 

**Status Summary**: See `docs/STEPS_1_TO_4_SUMMARY.md` for current status. Most of Steps 1-4 are done, but **Phase 2 (LMSR Trading)** is incomplete - predictions and resolution still use old proportional logic instead of LMSR.

**Goal**: Complete ALL steps before Step 5 (Personalization Feed), especially Phase 2.

---

## Task: Complete Phase 2 - LMSR Trading Integration

**Phase 2 Requirements** (from plan, Steps 2.1, 2.2, 2.3):

### Step 2.1: Prediction Creation with LMSR

**Current State**: 
- `app/api/predictions/route.ts` uses proportional pricing (yesCredits/noCredits)
- LMSR engine exists in `lib/pricing/lmsr.ts` (cost, getPrice, buyShares functions)
- Event model has `q_yes`, `q_no`, `b`, `p_init` fields
- Prediction model does NOT have `sharesYes`, `sharesNo`, `costBasis` fields yet

**What to Do**:
1. **Add LMSR fields to Prediction model** in `prisma/schema.prisma`:
   - `sharesYes Float?` - YES shares purchased (LMSR)
   - `sharesNo Float?` - NO shares purchased (LMSR)
   - `costBasis Float?` - Cost in credits (LMSR cost function)
   - Keep `credits` field for backward compatibility during migration

2. **Run migration**: `npx prisma migrate dev --name add_prediction_lmsr_fields`

3. **Update `app/api/predictions/route.ts`**:
   - Import `buyShares` from `@/lib/pricing/lmsr`
   - Import `getBParameter` from `@/lib/pricing/initialization` (use "Medium" hype for now)
   - Before creating prediction:
     - Get Event's current `q_yes`, `q_no`, `b`
     - Call `buyShares(q_yes, q_no, b, outcome, credits)` to calculate cost and new quantities
     - Validate user has enough credits (costPaid from buyShares)
   - In transaction:
     - Create Prediction with `sharesYes`/`sharesNo` (based on outcome) and `costBasis` (costPaid)
     - Update Event: `q_yes = newQYes`, `q_no = newQNo` (from buyShares result)
     - Deduct `costPaid` credits from user (not the original `credits` amount)
   - Remove old logic that updates `yesCredits`/`noCredits`/`totalCredits`
   - Keep validation (event exists, not resolved, closesAt > now, user has enough credits)

4. **Test**: Create a prediction and verify:
   - Event `q_yes` or `q_no` updated correctly
   - Prediction has `sharesYes`/`sharesNo` and `costBasis`
   - User credits deducted by `costPaid` (may differ from `credits` input)

**Acceptance Criteria**:
- ✅ Prediction creation uses `buyShares()` from LMSR
- ✅ Event `q_yes`/`q_no` updated atomically in transaction
- ✅ Prediction stores `sharesYes`/`sharesNo` and `costBasis`
- ✅ User credits deducted correctly (LMSR cost, not proportional)
- ✅ Old proportional fields (`yesCredits`/`noCredits`) no longer updated

---

### Step 2.2: Update Resolution with LMSR Payout

**Current State**:
- `app/api/admin/events/[id]/resolve/route.ts` uses proportional payout
- Formula: `payout = (prediction.credits / winningSideTotal) * totalCredits`

**What to Do**:
1. **Update `app/api/admin/events/[id]/resolve/route.ts`**:
   - Import `cost` from `@/lib/pricing/lmsr`
   - Get Event's final `q_yes`, `q_no`, `b` (after all trades)
   - Calculate final cost: `finalCost = cost(q_yes, q_no, b)`
   - For each prediction:
     - If `prediction.outcome === event.outcome` (winner):
       - Payout = `finalCost - prediction.costBasis` (LMSR cost difference)
       - If payout < 0, set to 0 (safety check)
     - Else (loser):
       - Payout = 0 (costBasis already deducted on creation)
   - Update user credits with payout (winners only)
   - Keep other logic (notifications, badges, stats)

2. **Test**: Resolve an event and verify:
   - Winners receive payout = finalCost - costBasis
   - Losers receive 0 (no additional deduction)
   - User credits updated correctly

**Acceptance Criteria**:
- ✅ Payouts calculated using LMSR `cost()` function
- ✅ Winners: payout = cost(final) - costBasis
- ✅ Losers: payout = 0 (costBasis already deducted)
- ✅ User credits updated correctly
- ✅ Transactions and notifications still work

---

### Step 2.3: Price Display Updates

**Current State**:
- UI components use `yesCredits / totalCredits` for probability
- Components: `components/EventCard.tsx`, `components/discover/MarketCard.tsx`, `components/landing/LandingEventRow.tsx`

**What to Do**:
1. **Create helper function** `lib/pricing/price-display.ts`:
   ```typescript
   import { getPrice } from "./lmsr";
   
   export function getEventProbability(event: { q_yes: number; q_no: number; b: number }): number {
     return getPrice(event.q_yes, event.q_no, event.b, "YES") * 100;
   }
   ```

2. **Update components** to use LMSR price:
   - `components/EventCard.tsx`: Replace `yesCredits/totalCredits` with `getEventProbability(event)`
   - `components/discover/MarketCard.tsx`: Same
   - `components/landing/LandingEventRow.tsx`: Same
   - Ensure Event queries include `q_yes`, `q_no`, `b` fields
   - Fallback to `event.probability` if LMSR fields missing (backward compatibility)

3. **Update API endpoints** that return events:
   - Ensure `q_yes`, `q_no`, `b` are included in Event selects
   - Or calculate `probability` server-side using `getEventProbability()` and include in response

**Acceptance Criteria**:
- ✅ UI shows LMSR price (from `getPrice(q_yes, q_no, b, "YES")`)
- ✅ Price updates correctly when trades happen
- ✅ Backward compatibility: falls back to `event.probability` if LMSR fields missing
- ✅ All event displays use LMSR price

---

## Verification Checklist

After completing Phase 2, verify:

- [ ] **Step 2.1**: Create a prediction → Event `q_yes`/`q_no` updates, Prediction has `sharesYes`/`costBasis`
- [ ] **Step 2.1**: User credits deducted by LMSR cost (may differ from input credits)
- [ ] **Step 2.2**: Resolve event → Winners get payout = finalCost - costBasis, losers get 0
- [ ] **Step 2.2**: User credits updated correctly after resolution
- [ ] **Step 2.3**: UI shows probability from LMSR (`getPrice(q_yes, q_no, b)`)
- [ ] **Step 2.3**: Price updates when new predictions are made
- [ ] **Migration**: Prediction schema has `sharesYes`, `sharesNo`, `costBasis` fields
- [ ] **Backward compatibility**: Old events without LMSR fields still work (fallback to `probability`)

---

## Additional Checks (Steps 1-4)

Verify these are already done (from `docs/STEPS_1_TO_4_SUMMARY.md`):

- [ ] **Step 1.1**: Schema has LMSR fields (`p_init`, `b`, `q_yes`, `q_no`) and time coherence fields
- [ ] **Step 1.2**: LMSR engine exists (`lib/pricing/lmsr.ts`, `lib/pricing/initialization.ts`)
- [ ] **Step 1.3**: Time coherence module exists (`lib/markets/time-coherence.ts`)
- [ ] **Step 1.4**: Event creation sets `b` and `resolutionBufferHours` (admin + create-events)
- [ ] **Step 3.1**: Validator exists (`lib/validator/`)
- [ ] **Step 3.2**: Validator integrated in pipeline and admin POST
- [ ] **Step 4.1**: Italy sources exist (`lib/ingestion/italy-sources.ts`)
- [ ] **Step 4.2**: Hype scoring exists (`lib/ingestion/hype-scorer.ts`) and used in pipeline

---

## Files to Modify

**Phase 2 Files**:
- `prisma/schema.prisma` - Add Prediction LMSR fields
- `app/api/predictions/route.ts` - Use LMSR for prediction creation
- `app/api/admin/events/[id]/resolve/route.ts` - Use LMSR for payouts
- `components/EventCard.tsx` - Use LMSR price
- `components/discover/MarketCard.tsx` - Use LMSR price
- `components/landing/LandingEventRow.tsx` - Use LMSR price
- `lib/pricing/price-display.ts` (new) - Helper for UI price calculation

**Reference Files** (already exist):
- `lib/pricing/lmsr.ts` - LMSR math functions
- `lib/pricing/initialization.ts` - b parameter strategy

---

## Constraints

- **Backward compatibility**: Keep `credits` field in Prediction, `yesCredits`/`noCredits` in Event (deprecated but not removed)
- **Migration**: Use Prisma migrations, don't break existing data
- **Atomicity**: Use Prisma transactions for prediction creation and resolution
- **Fallback**: If Event lacks LMSR fields (`q_yes`/`q_no`/`b`), fall back to `probability` field
- **Testing**: Test with real predictions and resolutions to verify math

---

## Stop and Ask If

- Migration fails or conflicts with existing data
- LMSR math doesn't match expected results (verify formulas)
- Price display breaks existing UI
- Backward compatibility issues arise

---

## Expected Outcome

After completing this prompt:
- ✅ All Steps 1-4 are fully implemented
- ✅ Predictions use LMSR pricing (not proportional)
- ✅ Resolution uses LMSR payouts
- ✅ UI shows LMSR prices
- ✅ Ready to proceed to Step 5 (Personalization Feed)

---

**Next Step**: Once Phase 2 is complete, proceed to Step 5.1 (User Profile Extraction) from the plan.
