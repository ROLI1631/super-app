**Alphabet Engine**

Purpose: Convert free-form text into normalized linguistic structures and numeric identifiers that integrate with the Numeric Universe and Event Pipeline.

Pipeline per detected string:
- Normalization
- Language Detection
- Synonym & Canonical Concept Resolution
- Numeric ID resolution via Dictionary or Numeric Universe
- Phrase parsing into a phrase tree
- Search graph generation (tokens, edges, canonical links)

Storage: The Event Pipeline stores the complete analysis under `metadata.alphabet` for each string path detected.

Design notes:
- The engine inspects payloads generically and recursively; no field names are hardcoded.
- Numeric Universe integration is optional; when provided the engine will attempt to resolve canonical labels to existing numeric nodes.
