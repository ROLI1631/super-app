import { EntityKind, NumericId } from '../core/types';

export interface NumericIndex {
  createId(entityKind: EntityKind, source?: string): NumericId;
  nextId(entityKind: EntityKind): NumericId;
  validateId(id: NumericId): boolean;
}
