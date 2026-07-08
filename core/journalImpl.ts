import { Journal, JournalEntry, JournalQuery } from './journal';
import { NumericId } from './types';

function deepFreeze<T>(value: T, visited = new WeakSet<object>()): T {
  if (value === null || typeof value !== 'object') {
    return value;
  }

  if (visited.has(value)) {
    return value;
  }

  visited.add(value);
  Object.freeze(value);

  if (Array.isArray(value)) {
    value.forEach((item) => deepFreeze(item, visited));
  } else {
    Object.values(value).forEach((child) => deepFreeze(child, visited));
  }

  return value;
}

export class InMemoryJournal implements Journal {
  private readonly entries: JournalEntry[] = [];
  private idSequence = 0;

  readAll(): readonly JournalEntry[] {
    return this.entries.slice();
  }

  readById(id: NumericId): JournalEntry | undefined {
    return this.entries.find((entry) => entry.id === id);
  }

  query(filter: JournalQuery): readonly JournalEntry[] {
    return this.entries.filter((entry) => {
      if (filter.intent && entry.intent !== filter.intent) {
        return false;
      }

      if (filter.protocol && entry.protocol !== filter.protocol) {
        return false;
      }

      if (filter.identityId !== undefined && entry.identityId !== filter.identityId) {
        return false;
      }

      if (filter.fromCoordinate && entry.coordinate < filter.fromCoordinate) {
        return false;
      }

      if (filter.toCoordinate && entry.coordinate > filter.toCoordinate) {
        return false;
      }

      if (filter.version && entry.version !== filter.version) {
        return false;
      }

      return true;
    });
  }

  append(entry: Omit<JournalEntry, 'id'>): JournalEntry {
    this.idSequence += 1;
    const journalEntry = deepFreeze({ ...entry, id: this.idSequence }) as JournalEntry;
    this.entries.push(journalEntry);
    return journalEntry;
  }
}
