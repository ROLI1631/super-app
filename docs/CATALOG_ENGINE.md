**Catalog Engine (Global Catalog)**

Purpose: Provide a universal, extensible catalog model that can describe any object in the SO8FI ecosystem and integrate with the Immutable Core and Engines.

Key concepts:
- Universal `CatalogObject` with global Numeric ID and generic `attributes` bag.
- Category tree with unlimited depth (`CategoryNode`).
- Attribute Engine: categories declare attribute definitions; values are stored on objects as dynamic key/value pairs.
- Search metadata produced per object via `AlphabetEngine` (numeric tokens, alphabet tokens, phrase and search graphs).
- Integration with `NumericUniverse` and `NavigationCore` for canonical resolution and routing.

Storage and API:
- In-memory reference implementation `InMemoryCatalog` provides registration, search and discovery APIs.
- Read-only API: `CatalogApi` exposes search, lookup, list-by-category and attribute discovery.

Extensibility:
- Catalog object types are open strings and may be extended by business modules.
- Attributes are dynamic; no hardcoded fields.
