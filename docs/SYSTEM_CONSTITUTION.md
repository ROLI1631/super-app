# System Constitution

This document is the highest architectural authority of this project.

Every future module, page, service, API, AI-generated file, and technical decision must comply with this Constitution.

No implementation may violate these principles.

---

## BLOCK 0 — PLATFORM ROLE

The platform is only a technology operator.

The platform is not:

- a bank
- a payment institution
- a cryptocurrency exchange
- a broker
- a buyer
- a seller
- a marketplace participant
- a service provider
- an employer
- a legal representative

The platform only provides:

- software
- digital identity
- technical infrastructure
- navigation
- communication
- immutable technical records

The operator never becomes a party to transactions.

All legal relationships exist exclusively between users.

The operator is responsible only for the operation of the platform.

---

## BLOCK 1 — AUTHENTICATION AND ZERO PERSONAL DATA

The platform uses Passkey authentication.

Biometric information never leaves the user’s device.

The platform never stores:

- fingerprints
- face scans
- iris scans
- biometric templates

During registration a unique Recovery Key is generated.

Rules:

- only the owner knows the Recovery Key
- the platform has no access to it
- the platform cannot regenerate it
- the platform cannot recover it
- the platform cannot replace it

The owner is solely responsible for storing the Recovery Key.

If the user loses:

- the device
- the Recovery Key

the platform cannot restore access.

If the owner wants another person to inherit the account or digital rights, the owner must independently transfer the Recovery Key.

The operator never participates in account recovery.

---

## BLOCK 2 — LEGAL SHIELD

Every registration creates an immutable legal consent record.

Every consent contains:

- unique identifier
- document version
- timestamp
- acceptance record

The user confirms:

- required legal age
- acceptance of Terms
- acceptance of Privacy Policy
- responsibility under the laws of the user’s jurisdiction

The operator only records technical evidence.

The operator never becomes a party to agreements between users.

---

## BLOCK 3 — DATA LIFECYCLE

Separate permanent legal records from temporary operational information.

Permanent legal records remain immutable.

Temporary analytics and operational data may have limited retention according to platform policy.

The platform minimizes long-term storage of temporary information.

The architecture must always prioritize:

- privacy
- minimal storage
- technical efficiency

---

## BLOCK 4 — INTERNAL COMMUNICATION

Platform communication exists only inside the ecosystem.

No SMTP.

No IMAP.

No public email infrastructure.

Support communication, notifications, and internal messages remain isolated inside the platform.

The operator provides only the communication infrastructure.

---

## BLOCK 5 — AI DEVELOPMENT RULES

Every AI system working on this project must follow these rules.

AI must:

- follow this Constitution before any task
- preserve architecture consistency
- generate modular code
- generate reusable components
- avoid unnecessary complexity
- document important architectural decisions
- follow the existing project structure

AI must not:

- modify architectural principles
- invent business logic
- change security principles
- change legal principles
- introduce external services without approval
- introduce databases without approval
- introduce authentication methods different from this Constitution
- create hidden functionality
- create code that contradicts this Constitution

If any task conflicts with this Constitution, the Constitution always has priority.

---

## GENERAL RULES

This Constitution is the highest technical document of the project.

All future documentation, prompts, modules, services, and source code must comply with it.

If a future task contradicts this Constitution, the task must be rejected or adapted to comply with the Constitution.

Architecture first.

Security first.

Privacy first.

Modularity first.

The platform evolves by extending modules, never by violating the Constitution.
