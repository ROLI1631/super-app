# Remaining TODO List

Date: 2026-07-06

## Critical TODO

1. Enforce single runtime chain entrypoint
- Create orchestrator that mandates Identity -> Intent -> Protocol -> Temporal -> SO8FI Code -> Journal -> Event Bus.
- Block direct calls from infrastructure APIs to module services.

2. Remove direct event publication from business modules
- Replace all direct publish calls in [engines/marketplaceImpl.ts](engines/marketplaceImpl.ts#L83) and [engines/financeImpl.ts](engines/financeImpl.ts#L27) with orchestrated journal-backed publication.

3. Implement Notification runtime stage
- Add notification service subscribed after business execution events.
- Persist notification outcome with coordinate-bound envelope.

4. Integrate Decoder into user output chain
- Wire decoder after notification before UI response rendering.

5. Enforce identity validation before intent acceptance
- Inject IdentityCore in gateway/orchestrator and reject unknown identities.

## High TODO

6. Remove CRUD-first contracts from engines
- Refactor [engines/marketplace.ts](engines/marketplace.ts#L73), [engines/finance.ts](engines/finance.ts#L66), [engines/catalog.ts](engines/catalog.ts#L69) to command/query + projection model.

7. Eliminate timestamp-first event creation in core/engines
- Replace Date-based event timestamps with temporal coordinates as operational order source.

8. Enforce Journal First globally
- Any state mutation must come only from journal replay/projection, not pre-journal mutable maps.

## Medium TODO

9. Add kernel rehydration and continuity persistence
- Persist/restore gear state from journal checkpoints.

10. Move calendar/time parsing out of TimeCore
- Restrict core temporal API to coordinate operations.

## Verification TODO

11. Add architecture guard tests
- Detect direct eventBus.publish calls in engines.
- Detect direct service invocation bypassing gateway/orchestrator.
- Detect Date.now/new Date().toISOString usage in operational event ordering.
