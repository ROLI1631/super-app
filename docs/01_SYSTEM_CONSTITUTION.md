# 01. System Constitution

## Purpose

This document describes the approved constitutional principles that govern the platform. It is the highest authority of the project and must be respected by all future documentation, architecture decisions, modules, and implementation work.

## Core Principles

### 1. Platform Role

The platform is a technology operator and infrastructure provider. It is not a bank, payment institution, broker, marketplace participant, service provider, employer, or legal representative. Its role is to provide software, digital identity, technical infrastructure, navigation, communication, and immutable technical records.

### 2. Authentication and Zero Personal Data

The platform uses Passkey authentication. Biometric information never leaves the user’s device. The platform does not store biometric templates or equivalent biometric data. Each registration produces a unique Recovery Key, which remains exclusively under the owner’s control.

### 3. Legal Shield

Every registration creates an immutable legal consent record. The platform records technical evidence of consent but never becomes a party to the legal relationship between users. The operator remains a technical infrastructure provider, not a participant in user agreements.

### 4. Data Lifecycle

The platform separates permanent legal records from temporary operational information. Permanent records remain immutable, while temporary data is minimized and retained only as necessary. Privacy, minimal storage, and technical efficiency are primary architectural concerns.

### 5. Internal Communication

Communication within the ecosystem remains internal to the platform. Public email infrastructure is not used for platform-native communication. Support, notifications, and internal messaging remain isolated within the platform’s own communication framework.

### 6. AI Governance

Every AI system that works on this project must follow the Constitution. AI must preserve architecture integrity, generate modular solutions, favor reuse over unnecessary complexity, and avoid altering the platform’s legal, security, or architectural principles.

## Constitutional Authority

Nothing may violate this Constitution. If a requirement conflicts with the Constitution, the Constitution wins. Architecture, security, privacy, and modularity take precedence over expedience.

## Future Expansion Notes

Future platform growth must remain consistent with the Constitution. New capabilities may be added only when they preserve the platform’s legal boundaries, privacy posture, and architectural integrity.

## Cross References

- [00_VISION.md](00_VISION.md)
- [02_NUMERIC_LANGUAGE.md](02_NUMERIC_LANGUAGE.md)
- [03_MODULARITY.md](03_MODULARITY.md)
- [04_ARCHITECTURE.md](04_ARCHITECTURE.md)
- [05_DEVELOPMENT_RULES.md](05_DEVELOPMENT_RULES.md)
- [06_AI_RULES.md](06_AI_RULES.md)
