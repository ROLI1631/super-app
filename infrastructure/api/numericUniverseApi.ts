import { NumericId } from '../../core/types';
import { NumericNode, NumericUniverseRegistry } from '../../engines/numericUniverse';
import { RuntimeOrchestrator } from '../runtime/orchestrator';

export interface NumericUniverseApi {
  getNode(id: NumericId, userId?: NumericId): Promise<NumericNode | undefined>;
  getChildren(id: NumericId, userId?: NumericId): Promise<readonly NumericNode[]>;
  getParent(id: NumericId, userId?: NumericId): Promise<NumericNode | undefined>;
  searchById(id: NumericId, userId?: NumericId): Promise<NumericNode | undefined>;
  searchByPath(path: readonly NumericId[], userId?: NumericId): Promise<readonly NumericNode[]>;
}

export class DefaultNumericUniverseApi implements NumericUniverseApi {
  constructor(
    private readonly registry: NumericUniverseRegistry,
    private readonly orchestrator?: RuntimeOrchestrator,
  ) {}

  async getNode(id: NumericId, userId = 1) {
    if (!this.orchestrator) {
      return this.registry.findById(id);
    }

    const execution = await this.orchestrator.execute({
      action: 'numeric.getNode',
      payload: { id },
      userId,
      sessionId: userId,
      containerId: 0,
      moduleId: 0,
    });

    return execution.result as NumericNode | undefined;
  }

  async getChildren(id: NumericId, userId = 1) {
    if (!this.orchestrator) {
      return this.registry.findChildren(id);
    }

    const execution = await this.orchestrator.execute({
      action: 'numeric.getChildren',
      payload: { id },
      userId,
      sessionId: userId,
      containerId: 0,
      moduleId: 0,
    });

    return execution.result as readonly NumericNode[];
  }

  async getParent(id: NumericId, userId = 1) {
    if (!this.orchestrator) {
      return this.registry.findParent(id);
    }

    const execution = await this.orchestrator.execute({
      action: 'numeric.getParent',
      payload: { id },
      userId,
      sessionId: userId,
      containerId: 0,
      moduleId: 0,
    });

    return execution.result as NumericNode | undefined;
  }

  async searchById(id: NumericId, userId = 1) {
    if (!this.orchestrator) {
      return this.registry.findById(id);
    }

    const execution = await this.orchestrator.execute({
      action: 'numeric.searchById',
      payload: { id },
      userId,
      sessionId: userId,
      containerId: 0,
      moduleId: 0,
    });

    return execution.result as NumericNode | undefined;
  }

  async searchByPath(path: readonly NumericId[], userId = 1) {
    if (!this.orchestrator) {
      return path.map((id) => this.registry.findById(id)).filter((node): node is NumericNode => node !== undefined);
    }

    const execution = await this.orchestrator.execute({
      action: 'numeric.searchByPath',
      payload: { path },
      userId,
      sessionId: userId,
      containerId: 0,
      moduleId: 0,
    });

    return execution.result as readonly NumericNode[];
  }
}
