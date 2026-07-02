import { EntityKind, NumericId } from '../core/types';
import { NumericIndex } from './numericIndex';

function nextPositiveInteger(value: number): NumericId {
  const normalized = Math.trunc(value);
  return normalized > 0 ? normalized : 1;
}

export class IncrementalNumericIndex implements NumericIndex {
  private readonly counters = new Map<EntityKind, NumericId>();
  private readonly sourceMap = new Map<string, NumericId>();

  createId(entityKind: EntityKind, source?: string): NumericId {
    if (source) {
      const key = `${entityKind}:${source}`;
      const existing = this.sourceMap.get(key);
      if (existing !== undefined) {
        return existing;
      }

      const id = this.nextId(entityKind);
      this.sourceMap.set(key, id);
      return id;
    }

    return this.nextId(entityKind);
  }

  nextId(entityKind: EntityKind): NumericId {
    const current = this.counters.get(entityKind) ?? 0;
    const next = nextPositiveInteger(current + 1);
    this.counters.set(entityKind, next);
    return next;
  }

  validateId(id: NumericId): boolean {
    return Number.isInteger(id) && id > 0;
  }
}
