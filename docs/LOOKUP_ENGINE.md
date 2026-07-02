# Lookup Engine

The Numeric Universe lookup engine provides read-only retrieval of numeric nodes.

## Services

- `findById(id)`
- `findChildren(id)`
- `findParent(id)`
- `findAncestors(id)`
- `findDescendants(id)`
- `findPath(id)`
- `exists(id)`

## Validation

The lookup engine validates the registry state for duplicates, missing parents, cycles, orphan nodes, and invalid references.
