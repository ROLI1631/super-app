# Core

The `core/` folder contains the immutable foundational contracts for SO8FI.

## Responsibilities

- Define platform-wide primitive types.
- Define the immutable Journal contract.
- Define the Event Bus contract.
- Define Identity and Navigation Core contracts.
- Define Temporal Kernel behavior and Time Core journal coupling.

## Rules

- Core may not depend on any business or module code.
- Journal records coordinate-first immutable envelopes.
- Journal is append-only and record immutable.
- All platform objects use Numeric IDs.
- Event communication flows through Event Bus only.
