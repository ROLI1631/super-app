import { EntityKind, Metadata, NumericId } from './types';

export interface NavigationTarget {
  readonly numericId: NumericId;
  readonly entityKind: EntityKind;
  readonly label: string;
  readonly routePath: string;
  readonly parameters?: Readonly<Record<string, string>>;
  readonly metadata?: Metadata;
}

export interface NavigationCore {
  resolveTarget(entityKind: EntityKind, id: NumericId, label: string): NavigationTarget;
  buildUrl(target: NavigationTarget): string;
  getDefaultRoute(entityKind: EntityKind): string;
}
