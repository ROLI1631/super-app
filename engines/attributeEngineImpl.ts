import { AttributeEngine, AttributeDefinition } from './attributeEngine';
import { NumericId } from '../core/types';

export class InMemoryAttributeEngine implements AttributeEngine {
  private readonly defs = new Map<NumericId, AttributeDefinition[]>();

  defineAttributes(categoryId: NumericId, attributes: readonly AttributeDefinition[]): void {
    this.defs.set(categoryId, attributes.slice());
  }

  getAttributes(categoryId: NumericId): readonly AttributeDefinition[] {
    return this.defs.get(categoryId) ?? [];
  }
}
