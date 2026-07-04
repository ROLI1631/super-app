import { NumericId } from '../../core/types';
import { NumericNode, NumericUniverseRegistry } from '../../engines/numericUniverse';

export interface NumericUniverseApi {
  getNode(id: NumericId): NumericNode | undefined;
  getChildren(id: NumericId): readonly NumericNode[];
  getParent(id: NumericId): NumericNode | undefined;
  searchById(id: NumericId): NumericNode | undefined;
  searchByPath(path: readonly NumericId[]): readonly NumericNode[];
}

export class DefaultNumericUniverseApi implements NumericUniverseApi {
  constructor(private readonly registry: NumericUniverseRegistry) {}

  getNode(id: NumericId) {
    return this.registry.findById(id);
  }

  getChildren(id: NumericId) {
    return this.registry.findChildren(id);
  }

  getParent(id: NumericId) {
    return this.registry.findParent(id);
  }

  searchById(id: NumericId) {
    return this.registry.findById(id);
  }

  searchByPath(path: readonly NumericId[]) {
    return path.map((id) => this.registry.findById(id)).filter((node): node is NumericNode => node !== undefined);
  }
}
