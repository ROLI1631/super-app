import { Journal, JournalEntry, JournalQuery } from './journal';
import { NumericId, Timestamp } from './types';

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
  private readonly entries: JournalEntry<object>[] = [];

  readAll(): readonly JournalEntry<object>[] {
    return this.entries.slice();
  }

  readById(id: NumericId): JournalEntry<object> | undefined {
    return this.entries.find((entry) => entry.id === id);
  }

  query(filter: JournalQuery): readonly JournalEntry<object>[] {
    return this.entries.filter((entry) => {
      if (filter.recordType && entry.recordType !== filter.recordType) {
        return false;
      }

      if (filter.recorderId !== undefined && entry.recorderId !== filter.recorderId) {
        return false;
      }

      if (filter.since && entry.createdAt < filter.since) {
        return false;
      }

      if (filter.until && entry.createdAt > filter.until) {
        return false;
      }

      return true;
    });
  }

  append<T extends object>(entry: Omit<JournalEntry<T>, 'createdAt'>): JournalEntry<T> {
    const timestamp: Timestamp = new Date().toISOString();
    const journalEntry = deepFreeze({ ...entry, createdAt: timestamp }) as JournalEntry<T>;
    this.entries.push(journalEntry as JournalEntry<object>);
    return journalEntry;
  }
}
