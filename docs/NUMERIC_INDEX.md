# Numeric Index

The Numeric Index engine creates and validates Numeric IDs used throughout SO8FI.

## Responsibilities

- Generate new numeric IDs for entity kinds.
- Ensure each generated ID is valid and unique within its kind.
- Expose deterministic `createId` and `nextId` operations.

## Behavior

- `nextId(entityKind)` increments a counter for the kind.
- `createId(entityKind, source)` produces stable IDs when the same source is reused.
- IDs are positive integers and are validated before use.
