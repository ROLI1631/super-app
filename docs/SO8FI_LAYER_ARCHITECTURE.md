# SO8FI Layer Architecture

## Purpose

This document defines the architectural layering model for the SO8FI Operating System. The goal is to preserve strict isolation between layers so the platform behaves like a governed operating system rather than a loose application.

## Layer Definitions

### Layer 1 — Presentation

Responsibilities:
- Render UI and user-facing pages.
- Collect input from forms and public interfaces.
- Present data from business modules.

Allowed dependencies:
- May call Business Modules only.

Forbidden dependencies:
- May not call Core directly.
- May not call Infrastructure directly.
- May not contain business logic.

### Layer 2 — Business Modules

Responsibilities:
- Own business workflows and module-specific behavior.
- Coordinate domain operations.
- Consume engines through stable interfaces.

Allowed dependencies:
- May call System Engines only.

Forbidden dependencies:
- May not call Core directly.
- May not call Infrastructure directly.
- May not call Presentation.

### Layer 3 — System Engines

Responsibilities:
- Provide reusable platform capabilities.
- Implement search, navigation, payment, notifications, translation, AI, analytics, and projections.
- Depend on Core contracts and platform primitives.

Allowed dependencies:
- May call Core only.

Forbidden dependencies:
- May not call Business Modules.
- May not call Presentation.
- May not call Infrastructure directly.

### Layer 4 — Core

Responsibilities:
- Own immutable platform primitives.
- Maintain journal, time, identity, protocol, event bus, event pipeline, and numeric language behavior.
- Provide stable contracts for the rest of the system.

Allowed dependencies:
- May call Infrastructure only through interfaces.

Forbidden dependencies:
- May not import Business Modules.
- May not import UI or Presentation.
- May not contain business logic.

### Layer 5 — Infrastructure

Responsibilities:
- Provide database, cache, queue, storage, deployment, monitoring, and environment integrations.
- Expose runtime adapters and hosting services.

Allowed dependencies:
- May be consumed by Core and higher layers through interfaces.

Forbidden dependencies:
- May not call Core.
- May not call Business Modules directly.

## Allowed Dependency Flow

Presentation → Business Modules
Business Modules → Engines
Engines → Core
Core → Infrastructure (interfaces only)
Infrastructure → none of the higher layers

## Forbidden Dependency Flow

- Core → Business Modules
- Core → UI
- Business Modules → Infrastructure
- Presentation → Infrastructure
- Presentation → Core
- Engines → Business Modules
- Infrastructure → Core

## Architecture Examples

### Presentation Example

A page may call a business module API facade.

### Business Module Example

A marketplace module may use the marketplace engine and notification engine.

### Engine Example

A search engine may use the numeric language and journal facilities provided by Core.

### Core Example

The journal writes events through the event bus and time core contracts.

### Infrastructure Example

The infrastructure factory composes engines and core services for runtime use.

## Validation Strategy

- Enforce imports through automated tests.
- Reject dependency violations during CI.
- Keep the architecture documentation aligned with implementation.
