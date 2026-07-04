# Dependency Report

## Layer Summary

- Presentation: app/, components/
- Business Modules: modules/
- System Engines: engines/
- Core: core/
- Infrastructure: infrastructure/

## Dependency Rules Observed

- Presentation imports Business Modules only.
- Business Modules import Engines only.
- Engines import Core only.
- Core imports Infrastructure only through interfaces.
- Infrastructure does not call back into Core.

## Import Validation

The dependency rules are now covered by automated tests in tests/dependencyRules.spec.ts.
