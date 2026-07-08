# Missing Components Report

Date: 2026-07-06

## Missing or Incomplete Components

1. Runtime Notification Engine
- Status: Missing in executable runtime layer
- Evidence: no notification implementation files in infrastructure/core runtime scan
- Needed for: chain segment Business Module -> Notification -> Decoder

2. Chain Orchestrator (single entrypoint)
- Status: Missing
- Evidence: multiple direct entry paths to modules and event bus
- Files showing bypass:
  - [infrastructure/api/marketplaceApi.ts](infrastructure/api/marketplaceApi.ts#L14)
  - [engines/numericNavigation.ts](engines/numericNavigation.ts#L58)

3. Identity verification gate in dispatch path
- Status: Missing
- Evidence:
  - [infrastructure/api/gateway.ts](infrastructure/api/gateway.ts#L20) does not resolve identity via IdentityCore

4. Decoder integration in runtime output pipeline
- Status: Incomplete
- Evidence:
  - Decoder created in [infrastructure/factory.ts](infrastructure/factory.ts#L94)
  - No invocation from event pipeline/notification path

5. Durable Temporal continuity mechanism
- Status: Missing
- Evidence:
  - Kernel constructed in-memory at [core/factory.ts](core/factory.ts#L46)
  - No checkpoint/rehydration logic from journal

6. Enforced Journal First write gateway for business modules
- Status: Incomplete
- Evidence:
  - Direct state mutation in [engines/marketplaceImpl.ts](engines/marketplaceImpl.ts#L74)
  - Direct state mutation in [engines/financeImpl.ts](engines/financeImpl.ts#L78)

7. Event First universal policy enforcement
- Status: Incomplete
- Evidence:
  - Only RAW_EVENT channel path is governed by [core/eventPipeline.ts](core/eventPipeline.ts#L28)
  - Domain-specific event publication occurs directly in modules

## Priority Order

1. Chain Orchestrator + Identity Gate
2. Notification + Decoder integration
3. Journal/Event First enforcement across business modules
4. Temporal durability and rehydration
5. Removal of CRUD-first interfaces in business contracts
