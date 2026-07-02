# Marketplace Engine (TOM 8)

Resumen del Engine de Marketplace (TOM8).

Componentes principales:
- Contratos: `Listing`, `Offer`, `Order`, `Reservation`, `Negotiation`, `Participant`.
- Servicio en memoria: `InMemoryMarketplace` (creación, consulta, listados básicos).
- API ligero: `MarketplaceApi` para flujos de alto nivel desde la capa API.

Integración:
- Se integra mediante `CoreServices` en [core/factory.ts](core/factory.ts).
- Respeta la filosofía Immutable Core: no altera núcleos existentes; usa servicios auxiliares.

Limitaciones y alcance:
- Implementación en memoria para pruebas y POC. No incluye pagos, conciliación ni persistencia.
- Metadata libre en `metadata` para auditoría y rastro de eventos (cuando se integre con EventBus).
