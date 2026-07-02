# Modules

`modules/` contains replaceable domain modules and business capabilities. It is intentionally separate from the immutable Core and engine contracts.

## Rules

- Modules may depend on `core/` and `engines/` only.
- Modules may never communicate directly with each other.
- All inter-module communication must use `Event Bus`.
- No module may write directly to `Journal`.
