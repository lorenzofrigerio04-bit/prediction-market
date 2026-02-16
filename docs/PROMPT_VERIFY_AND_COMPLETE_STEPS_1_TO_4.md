# Agent Mode Prompt: Verify and Complete Steps 1–4 (Included)

Copy this entire prompt into a **new Agent Mode chat** to verify that everything between Step 1 and Step 4 (both included) is done, and to implement anything that is still missing.

---

## Context

We have an upgrade plan for a prediction market (Italy-first, binary, LMSR). Steps 1–4 cover:

- **Phase 1 (Steps 1.1–1.4):** Foundation — schema, LMSR engine, time coherence, event creation with `b`.
- **Phase 2 (Steps 2.1–2.3):** LMSR trading — prediction creation with `buyShares`, resolution with LMSR payouts, UI price from `getPrice(q_yes, q_no, b)`.
- **Phase 3 (Steps 3.1–3.2):** Deterministic validator — module + integration in pipeline and admin POST.
- **Phase 4 (Steps 4.1–4.2):** Italy-first ingestion — Italy sources and hype scoring in pipeline.

**Reference:** `docs/STEPS_1_TO_4_SUMMARY.md` (status), `docs/PROMPT_COMPLETE_STEPS_1_TO_4.md` (detailed Phase 2 spec).

---

## Your Task

1. **Audit** the codebase against the checklist below and mark what is **done** vs **missing**.
2. **Implement** only the items that are missing or broken.
3. **Optional:** Add resolution backward compatibility for legacy predictions (see below).

---

## Verification Checklist (Steps 1–4)

Go through each item and confirm in code (or implement if missing).

### Phase 1: Foundation

- [ ] **1.1 Schema**  
  - Event: `p_init`, `b`, `q_yes`, `q_no`, `realWorldEventTime`, `resolutionTimeExpected`, `resolutionBufferHours`, `resolutionStatus`.  
  - Models: `MarketMetrics`, `UserSession`, `UserProfile`.  
  - File: `prisma/schema.prisma`.

- [ ] **1.2 LMSR engine**  
  - `lib/pricing/lmsr.ts`: `cost()`, `getPrice()`, `buyShares()`, `sellShares()`.  
  - `lib/pricing/initialization.ts`: `getBParameter(category, hype)` (e.g. "Medium").

- [ ] **1.3 Time coherence**  
  - `lib/markets/time-coherence.ts`: category buffers and validation (e.g. `validateTimeCoherence`, `getCategoryBuffer`).

- [ ] **1.4 Event creation with LMSR**  
  - When creating events (admin API and `lib/event-generation/create-events.ts`): set `b` (e.g. via `getBParameter`) and `resolutionBufferHours` (e.g. via `getBufferHoursForCategory` or equivalent).  
  - `q_yes` / `q_no` can stay 0 by default.

### Phase 2: Trading with LMSR

- [ ] **2.1 Prediction creation**  
  - Prediction model has `sharesYes`, `sharesNo`, `costBasis` (optional/Float).  
  - Migration applied: table `predictions` has columns `sharesYes`, `sharesNo`, `costBasis`.  
  - `app/api/predictions/route.ts`: uses `buyShares(q_yes, q_no, b, outcome, credits)`; creates prediction with `sharesYes`/`sharesNo`/`costBasis`; updates event `q_yes`/`q_no` in the same transaction; deducts `actualCostPaid` from user credits.  
  - No update to deprecated `yesCredits`/`noCredits`/`totalCredits` on Event for new flow.

- [ ] **2.2 Resolution**  
  - `app/api/admin/events/[id]/resolve/route.ts`: uses `cost(q_yes, q_no, b)` for final cost; winner payout = `max(0, floor(finalCost - costBasis))`; losers get 0; user credits updated for winners.

- [ ] **2.3 Price display**  
  - `lib/pricing/price-display.ts`: e.g. `getEventProbability(event)` using `getPrice(q_yes, q_no, b, "YES") * 100`.  
  - `EventCard`, `MarketCard`, `LandingEventRow` (or equivalent) use LMSR-based probability with fallback to `event.probability` when LMSR fields are missing.  
  - Event list/detail APIs return or expose `q_yes`, `q_no`, `b` (e.g. full Event model or explicit select).

### Phase 3: Validator

- [ ] **3.1 Validator module**  
  - `lib/validator/`: e.g. `validator.ts`, `rules.ts`, `types.ts`; returns `{ valid, needsReview, reasons }`; hard-fail and needs-review rules.

- [ ] **3.2 Integration**  
  - `lib/event-generation/create-events.ts`: run validator before creating each event; skip create when `valid === false`; when `needsReview === true`, set `resolutionStatus = "NEEDS_REVIEW"`.  
  - Admin POST create event: `app/api/admin/events/route.ts`: run validator; return 400 when `valid === false`; set `resolutionStatus = "NEEDS_REVIEW"` when `needsReview === true`.

### Phase 4: Italy-first ingestion

- [ ] **4.1 Italy sources**  
  - `lib/ingestion/italy-sources.ts` (or equivalent): whitelist/boost for ANSA, Corriere, Repubblica, etc., and used in pipeline.

- [ ] **4.2 Hype scoring**  
  - `lib/ingestion/hype-scorer.ts`: score by recency/source authority; used in ranking (e.g. `rankByHypeAndItaly` in `lib/event-generation/run-pipeline.ts` before verify).

---

## Optional: Resolution backward compatibility for legacy predictions

If you need to **resolve events that still have old predictions** (no `costBasis`):

- In `app/api/admin/events/[id]/resolve/route.ts`, for each prediction:
  - If `prediction.costBasis != null` (LMSR): keep current logic `payout = max(0, floor(finalCost - costBasis))`.
  - If `prediction.costBasis == null` (legacy): use the old proportional formula, e.g.  
    `payout = (prediction.credits / winningSideTotal) * totalCredits` (with `totalCredits`/`yesCredits`/`noCredits` from Event or equivalent), and ensure minimum payout at least `prediction.credits` for winners if desired.
- Document this behavior in a short comment in the resolve route.

---

## Migration

- Ensure migration that adds `sharesYes`, `sharesNo`, `costBasis` to `predictions` exists and is **applied** to the database (e.g. `npx prisma migrate deploy` or equivalent). If the migration was only created and marked applied without running SQL, run the corresponding `ALTER TABLE` statements or re-apply the migration.

---

## Deliverables

1. **Short report** in chat: for each step 1.1–1.4, 2.1–2.3, 3.1–3.2, 4.1–4.2, state **Done** or **Implemented** (with what you changed).
2. **Code changes** only for missing or broken items (and optional legacy resolution behavior).
3. **Update** `docs/STEPS_1_TO_4_SUMMARY.md` if you change the status of any step.

---

## Expected outcome

After running this prompt in Agent Mode:

- Every item in the checklist is verified or implemented.
- Steps 1–4 are complete and the codebase is ready to proceed to Step 5 (e.g. Personalization Feed).
