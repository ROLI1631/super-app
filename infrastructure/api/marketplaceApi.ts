import { RuntimeOrchestrator } from '../runtime/orchestrator';

export class MarketplaceApi {
  constructor(private readonly orchestrator: RuntimeOrchestrator) {}

  async createListing(userId: number, input: { title: string; description?: string; categoryId?: number; price?: number }) {
    const execution = await this.orchestrator.execute({
      action: 'marketplace.createListing',
      payload: {
        ownerId: userId,
        input,
      },
      userId,
      sessionId: userId,
      containerId: 0,
      moduleId: 0,
    });

    return execution.result;
  }

  async createOffer(userId: number, listingId: number, amount: number) {
    const execution = await this.orchestrator.execute({
      action: 'marketplace.createOffer',
      payload: {
        userId,
        listingId,
        amount,
      },
      userId,
      sessionId: userId,
      containerId: 0,
      moduleId: 0,
    });

    return execution.result;
  }

  async getListing(id: number, userId = 1) {
    const execution = await this.orchestrator.execute({
      action: 'marketplace.getListing',
      payload: { id },
      userId,
      sessionId: userId,
      containerId: 0,
      moduleId: 0,
    });
    return execution.result;
  }

  async getOffer(id: number, userId = 1) {
    const execution = await this.orchestrator.execute({
      action: 'marketplace.getOffer',
      payload: { id },
      userId,
      sessionId: userId,
      containerId: 0,
      moduleId: 0,
    });
    return execution.result;
  }

  async getReservation(id: number, userId = 1) {
    const execution = await this.orchestrator.execute({
      action: 'marketplace.getReservation',
      payload: { id },
      userId,
      sessionId: userId,
      containerId: 0,
      moduleId: 0,
    });
    return execution.result;
  }

  async getOrder(id: number, userId = 1) {
    const execution = await this.orchestrator.execute({
      action: 'marketplace.getOrder',
      payload: { id },
      userId,
      sessionId: userId,
      containerId: 0,
      moduleId: 0,
    });
    return execution.result;
  }

  async getNegotiation(id: number, userId = 1) {
    const execution = await this.orchestrator.execute({
      action: 'marketplace.getNegotiation',
      payload: { id },
      userId,
      sessionId: userId,
      containerId: 0,
      moduleId: 0,
    });
    return execution.result;
  }

  async listListings(categoryId?: number, userId = 1) {
    const execution = await this.orchestrator.execute({
      action: 'marketplace.listListings',
      payload: { categoryId },
      userId,
      sessionId: userId,
      containerId: 0,
      moduleId: 0,
    });
    return execution.result;
  }

  async listOrders(userId = 1) {
    const execution = await this.orchestrator.execute({
      action: 'marketplace.listOrders',
      payload: {},
      userId,
      sessionId: userId,
      containerId: 0,
      moduleId: 0,
    });
    return execution.result;
  }

  async listReservations(userId = 1) {
    const execution = await this.orchestrator.execute({
      action: 'marketplace.listReservations',
      payload: {},
      userId,
      sessionId: userId,
      containerId: 0,
      moduleId: 0,
    });
    return execution.result;
  }

  async listOffers(userId = 1) {
    const execution = await this.orchestrator.execute({
      action: 'marketplace.listOffers',
      payload: {},
      userId,
      sessionId: userId,
      containerId: 0,
      moduleId: 0,
    });
    return execution.result;
  }
}

export function createMarketplaceApi(orchestrator: RuntimeOrchestrator) {
  return new MarketplaceApi(orchestrator);
}
