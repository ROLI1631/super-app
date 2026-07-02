import { Metadata, NumericId } from '../core/types';

export type NumericPath = readonly NumericId[];

export interface NumericNodeInput {
  readonly id: NumericId;
  readonly parentId?: NumericId;
  readonly kind: string;
  readonly label: string;
  readonly metadata?: Metadata;
}

export interface NumericNode extends NumericNodeInput {
  readonly childrenIds: readonly NumericId[];
  readonly depth: number;
  readonly path: NumericPath;
}

export interface NumericUniverseValidationError {
  readonly code: string;
  readonly message: string;
  readonly nodeId?: NumericId;
}

export interface NumericUniverseValidationResult {
  readonly valid: boolean;
  readonly errors: readonly NumericUniverseValidationError[];
}

export interface NumericUniverseRegistry {
  registerNode(node: NumericNodeInput): NumericNode;
  findById(id: NumericId): NumericNode | undefined;
  findChildren(id: NumericId): readonly NumericNode[];
  findParent(id: NumericId): NumericNode | undefined;
  findAncestors(id: NumericId): readonly NumericNode[];
  findDescendants(id: NumericId): readonly NumericNode[];
  findPath(id: NumericId): NumericPath;
  findSiblings(id: NumericId): readonly NumericNode[];
  exists(id: NumericId): boolean;
  validate(): NumericUniverseValidationResult;
  importJson(content: string): readonly NumericNode[];
  importJsonLd(content: string): readonly NumericNode[];
  importCsv(content: string): readonly NumericNode[];
  exportJson(): string;
  exportJsonLd(): string;
  exportCsv(): string;
}
