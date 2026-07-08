import { NumericId, LanguageCode } from '../../core/types';
import { RuntimeOrchestrator } from '../runtime/orchestrator';

export class CatalogApi {
  constructor(private readonly orchestrator: RuntimeOrchestrator) {}

  async search(query: string, language?: LanguageCode, userId = 1) {
    const execution = await this.orchestrator.execute({
      action: 'catalog.search',
      payload: {
        query,
        language,
      },
      userId,
      sessionId: userId,
      containerId: 0,
      moduleId: 0,
    });

    return execution.result;
  }

  async getById(id: NumericId, userId = 1) {
    const execution = await this.orchestrator.execute({
      action: 'catalog.getById',
      payload: { id },
      userId,
      sessionId: userId,
      containerId: 0,
      moduleId: 0,
    });

    return execution.result;
  }

  async getByCategory(categoryId: NumericId, userId = 1) {
    const execution = await this.orchestrator.execute({
      action: 'catalog.getByCategory',
      payload: { categoryId },
      userId,
      sessionId: userId,
      containerId: 0,
      moduleId: 0,
    });

    return execution.result;
  }

  async getHierarchy(parentId?: NumericId, userId = 1) {
    const execution = await this.orchestrator.execute({
      action: 'catalog.getHierarchy',
      payload: { parentId },
      userId,
      sessionId: userId,
      containerId: 0,
      moduleId: 0,
    });

    return execution.result;
  }

  async discoverAttributes(categoryId: NumericId, userId = 1) {
    const execution = await this.orchestrator.execute({
      action: 'catalog.discoverAttributes',
      payload: { categoryId },
      userId,
      sessionId: userId,
      containerId: 0,
      moduleId: 0,
    });

    return execution.result;
  }
}
