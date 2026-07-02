import { NumericId, Metadata } from '../core/types';

export interface AttributeDefinition {
  readonly name: string;
  readonly type: 'string' | 'number' | 'boolean' | 'date' | 'enum' | 'object' | 'array';
  readonly metadata?: Metadata;
}

export interface AttributeEngine {
  defineAttributes(categoryId: NumericId, attributes: readonly AttributeDefinition[]): void;
  getAttributes(categoryId: NumericId): readonly AttributeDefinition[];
}
