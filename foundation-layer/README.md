# Foundation Layer Pack v1

`foundation-layer` is the domain-core package for Market Design Engine.

It provides schema-first contracts, strongly typed domain primitives, deterministic validation, and workflow lifecycle rules. The package is intentionally pure and side-effect free so it can be imported by future ingestion, extraction, API, and persistence layers.

## Scope

Included:
- domain entities
- immutable value objects
- domain enums
- modular JSON Schemas (Draft 2020-12)
- Ajv schema validators
- domain invariant validators
- deterministic workflow state machine
- unit and integration tests (Vitest)

Intentionally out of scope:
- source ingestion implementation
- scraping/crawling
- LLM/extraction logic
- persistence/database/ORM
- HTTP API/server
- queues/background jobs
- UI/frontend
- external service integrations

## Architecture

Directory layout:
- `src/common`: base errors, utility types, deterministic helpers
- `src/enums`: canonical enum vocabulary
- `src/value-objects`: invariant-protected immutable primitives
- `src/entities`: domain entities with guarded creation boundaries
- `src/schemas`: modular JSON Schema contracts
- `src/validators`: schema + domain-invariant deterministic validators
- `src/workflow`: workflow states, transitions, and machine
- `src/factories`: thin factory exports for entity creation
- `tests`: value objects, entities, validators, workflow, integration flow

Dependency direction:

`enums/value-objects -> schemas/types -> entities -> validators -> workflow`

## Validation Model

Each entity validator follows:
1. **Schema validation** with Ajv against explicit JSON Schema.
2. **Domain invariant validation** for rules JSON Schema cannot safely enforce (normalization-based uniqueness, cross-field checks, transition legality).
3. **Stable issue ordering** by `path`, `code`, `message`.
4. **Deterministic report output** via `ValidationReport`.

Validation report timestamps are deterministic and explicit:
- validators accept optional `generatedAt` in validation options
- default `generatedAt` is a fixed deterministic epoch value
- no hidden wall-clock calls are used in report construction

Schema registration is strict:
- validators fail fast with `SCHEMA_NOT_REGISTERED` if Ajv does not contain the required schema
- missing schema registration is treated as programmer/configuration error

Ordinary validation failures return `ValidationReport` with machine-readable issue codes.

## Workflow Model

Supported states:
- `DRAFT`
- `VALIDATED`
- `CANONICAL`
- `CLAIM_DERIVED`
- `MARKET_COMPOSED`
- `FINALIZED`
- `REJECTED`
- `ARCHIVED`

Legal transitions are encoded explicitly in `foundation-workflow.rules.ts`, and `applyTransition()` enforces legality with immutable history appends.

Initialization semantics:
- workflow history must start with `null -> DRAFT` via `INITIALIZE`
- `REOPEN` is reserved for `REJECTED -> DRAFT`

Reject/reopen/archive policy:
- `REJECT` is allowed from every non-`ARCHIVED` state
- `REJECTED --REJECT--> REJECTED` is explicitly idempotent
- `REJECTED --REOPEN--> DRAFT`
- `FINALIZED --ARCHIVE--> ARCHIVED`
- `REJECTED --ARCHIVE--> ARCHIVED`

## Usage

Install dependencies:

```bash
npm install
```

Typecheck:

```bash
npm run typecheck
```

Run tests:

```bash
npm test
```
