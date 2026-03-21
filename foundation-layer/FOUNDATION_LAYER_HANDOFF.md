# Foundation Layer Handoff

## Purpose

`foundation-layer` is the domain-core package for Market Design Engine.
It defines canonical domain types, invariants, schemas, validators, and workflow lifecycle rules that downstream modules must reuse instead of redefining.

## What This Package Contains

- Strongly typed domain enums
- Immutable value objects with runtime guards
- Domain entities with invariant-enforcing creation boundaries
- Draft 2020-12 JSON Schemas for value objects and entities
- Ajv-based schema validation + deterministic domain-invariant validation
- Workflow state machine and workflow consistency validation
- Vitest unit/integration tests for core behavior

## What This Package Explicitly Does NOT Contain

- Ingestion, scraping, extraction, LLM integration
- API/server logic
- Database/persistence/ORM/migrations
- Queues/background jobs
- UI/frontend concerns
- External service adapters
- Market optimization/generation engines beyond candidate structure modeling

## Public Domain Concepts Exposed

- **Enums**: event lifecycle, category/priority, source type, claim polarity, outcome types, resolution basis, validator severity, confidence tiers, workflow states/transitions
- **Value Objects**: IDs, version, text primitives, URL, timestamp/ranges, probability/confidence, money
- **Entities**: `SourceRecord`, `EventSignal`, `CanonicalEvent`, `StructuredClaim`, `MarketOutcome`, `CandidateMarket`, `ValidationReport`, `WorkflowInstance`
- **Factories**: thin constructors over entity creation functions
- **Validation APIs**: per-entity validators returning deterministic `ValidationReport`
- **Workflow APIs**: `canTransition`, `getNextState`, `applyTransition`, initialization helper

## Workflow Summary

### States

- `DRAFT`
- `VALIDATED`
- `CANONICAL`
- `CLAIM_DERIVED`
- `MARKET_COMPOSED`
- `FINALIZED`
- `REJECTED`
- `ARCHIVED`

### Transition Semantics

- Initialization: `null -> DRAFT` via `INITIALIZE`
- Linear build path:
  - `DRAFT --VALIDATE--> VALIDATED`
  - `VALIDATED --CANONICALIZE--> CANONICAL`
  - `CANONICAL --DERIVE_CLAIM--> CLAIM_DERIVED`
  - `CLAIM_DERIVED --COMPOSE_MARKET--> MARKET_COMPOSED`
  - `MARKET_COMPOSED --FINALIZE--> FINALIZED`
- Reject policy:
  - `REJECT` allowed from any non-`ARCHIVED` state
  - `REJECTED --REJECT--> REJECTED` is explicitly idempotent
- Recovery/archive:
  - `REJECTED --REOPEN--> DRAFT`
  - `FINALIZED --ARCHIVE--> ARCHIVED`
  - `REJECTED --ARCHIVE--> ARCHIVED`

## Validation Architecture Summary

- Validation is two-layer:
  1. JSON Schema structural validation (Ajv)
  2. Domain invariant validation (cross-field/order/uniqueness/workflow legality)
- Validation issues are machine-readable and stably ordered by `path`, `code`, `message`.
- Schema lookup is strict: missing schema registration fails fast with `SCHEMA_NOT_REGISTERED`.
- `ValidationReport.generatedAt` is deterministic/testable:
  - optional `generatedAt` can be injected by callers
  - deterministic default exists for stable non-injected behavior

## How Downstream Modules Should Depend on It

- Import domain concepts from `foundation-layer/src/index.ts` public exports only.
- Treat this package as the single source of truth for:
  - entity shape
  - schema contracts
  - workflow legality
  - validation issue semantics
- Do not duplicate regex/pattern/range rules in downstream modules.
- Validate at module boundaries using foundation validators before persistence/API/publication.

## Extension Rules for Future Modules

- Add new domain concepts in the same layered order:
  `enums/value-objects -> schemas -> entities -> validators -> workflow/tests`.
- Every externally shaped structure must have schema + validator + tests.
- New workflow transitions/states require synchronized updates in:
  - enum
  - rule map
  - machine logic
  - workflow validator checks
  - schemas (if represented)
  - tests and docs
- Avoid adding infrastructure concerns into this package.

## Breaking-Change Guidance

- Treat as **breaking** when changing:
  - enum values
  - entity/value-object field names or requiredness
  - ID patterns/normalization behavior
  - validation issue codes/paths semantics
  - workflow states/transitions legality
  - schema `$id` or referenced contract structure
- Prefer additive evolution:
  - add new optional fields with explicit schema/docs/tests
  - add new enums conservatively with compatibility notes
- If a breaking change is unavoidable:
  - document migration path
  - update tests to capture old/new behavior explicitly
  - coordinate downstream module updates in lockstep
