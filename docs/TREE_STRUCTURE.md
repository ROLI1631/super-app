# Tree Structure

The Numeric Universe relies on a tree structure for hierarchy.

## Node model

- `id`: immutable numeric identifier.
- `parentId`: optional parent node reference.
- `kind`: entity kind, e.g. sector, category, module.
- `label`: human-readable name.
- `childrenIds`: direct child node IDs.
- `depth`: distance from the root.
- `path`: complete path of IDs from root to current node.

## Traversal

- `parent`: direct parent node.
- `children`: direct child nodes.
- `ancestors`: chain of parent nodes.
- `descendants`: all nested children.
- `siblings`: nodes sharing the same parent.
