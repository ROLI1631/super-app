import { NumericNode, NumericNodeInput, NumericUniverseRegistry, NumericUniverseValidationError, NumericUniverseValidationResult, NumericPath } from './numericUniverse';
import { NumericId } from '../core/types';

function parseCsvLine(line: string): string[] {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];

    if (char === '"') {
      if (inQuotes && line[index + 1] === '"') {
        current += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === ',' && !inQuotes) {
      values.push(current);
      current = '';
      continue;
    }

    current += char;
  }

  values.push(current);
  return values;
}

function parseCsv(content: string): Array<Record<string, string>> {
  const lines = content.trim().split(/\r?\n/);
  if (lines.length === 0) {
    return [];
  }

  const headers = parseCsvLine(lines[0]).map((header) => header.trim());
  return lines.slice(1).map((line) => {
    const values = parseCsvLine(line).map((value) => value.trim());
    const record: Record<string, string> = {};
    headers.forEach((header, index) => {
      record[header] = values[index] ?? '';
    });
    return record;
  });
}

function buildNode(input: NumericNodeInput, path: NumericPath, childrenIds: readonly NumericId[]): NumericNode {
  return {
    ...input,
    childrenIds,
    path,
    depth: path.length - 1,
  };
}

export class InMemoryNumericUniverse implements NumericUniverseRegistry {
  private readonly nodes = new Map<NumericId, NumericNode>();
  private readonly childrenIndex = new Map<NumericId, Set<NumericId>>();

  registerNode(input: NumericNodeInput): NumericNode {
    if (this.nodes.has(input.id)) {
      throw new Error(`Duplicate numeric id detected: ${input.id}`);
    }

    if (input.parentId !== undefined && !this.nodes.has(input.parentId)) {
      throw new Error(`Missing parent node: ${input.parentId}`);
    }

    const path = input.parentId !== undefined ? [...this.findPath(input.parentId), input.id] : [input.id];
    const node: NumericNode = buildNode(input, path, []);

    this.nodes.set(input.id, node);
    if (input.parentId !== undefined) {
      const existing = this.childrenIndex.get(input.parentId) ?? new Set<NumericId>();
      existing.add(input.id);
      this.childrenIndex.set(input.parentId, existing);

      const parent = this.nodes.get(input.parentId);
      if (parent) {
        this.nodes.set(input.parentId, {
          ...parent,
          childrenIds: [...parent.childrenIds, input.id],
        });
      }
    }

    return node;
  }

  findById(id: NumericId): NumericNode | undefined {
    return this.nodes.get(id);
  }

  findChildren(id: NumericId): readonly NumericNode[] {
    const children = this.childrenIndex.get(id);
    if (!children) {
      return [];
    }

    return Array.from(children).map((childId) => this.nodes.get(childId)!).filter(Boolean);
  }

  findParent(id: NumericId): NumericNode | undefined {
    const node = this.nodes.get(id);
    if (!node || node.parentId === undefined) {
      return undefined;
    }

    return this.nodes.get(node.parentId);
  }

  findAncestors(id: NumericId): readonly NumericNode[] {
    const node = this.findById(id);
    if (!node) {
      return [];
    }

    return node.path.slice(0, -1).map((ancestorId) => this.nodes.get(ancestorId)!).filter(Boolean);
  }

  findDescendants(id: NumericId): readonly NumericNode[] {
    const descendants: NumericNode[] = [];
    const queue: NumericId[] = [id];

    while (queue.length > 0) {
      const currentId = queue.shift()!;
      const children = this.childrenIndex.get(currentId);
      if (!children) {
        continue;
      }

      children.forEach((childId) => {
        const child = this.nodes.get(childId);
        if (child) {
          descendants.push(child);
          queue.push(childId);
        }
      });
    }

    return descendants;
  }

  findPath(id: NumericId): NumericPath {
    const node = this.findById(id);
    return node ? node.path : [];
  }

  findSiblings(id: NumericId): readonly NumericNode[] {
    const node = this.findById(id);
    if (!node || node.parentId === undefined) {
      return [];
    }

    return this.findChildren(node.parentId).filter((child) => child.id !== id);
  }

  exists(id: NumericId): boolean {
    return this.nodes.has(id);
  }

  validate(): NumericUniverseValidationResult {
    const errors: NumericUniverseValidationError[] = [];

    const visited = new Set<NumericId>();
    const stack = new Set<NumericId>();

    const visit = (nodeId: NumericId): void => {
      if (stack.has(nodeId)) {
        errors.push({
          code: 'cycle',
          nodeId,
          message: `Cycle detected at node ${nodeId}`,
        });
        return;
      }

      if (visited.has(nodeId)) {
        return;
      }

      visited.add(nodeId);
      stack.add(nodeId);

      const node = this.nodes.get(nodeId);
      if (!node) {
        stack.delete(nodeId);
        return;
      }

      if (node.parentId !== undefined && !this.nodes.has(node.parentId)) {
        errors.push({
          code: 'missing_parent',
          nodeId,
          message: `Node ${nodeId} references missing parent ${node.parentId}`,
        });
      }

      const children = this.childrenIndex.get(nodeId);
      if (children) {
        children.forEach((childId) => visit(childId));
      }

      stack.delete(nodeId);
    };

    Array.from(this.nodes.keys()).forEach((id) => visit(id));

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  importJson(content: string): readonly NumericNode[] {
    const input = JSON.parse(content) as NumericNodeInput[];
    return input.map((node) => this.registerNode(node));
  }

  importJsonLd(content: string): readonly NumericNode[] {
    const input = JSON.parse(content) as Array<Record<string, unknown>>;
    return input.map((record) => {
      const node: NumericNodeInput = {
        id: Number(record['id']),
        parentId: record['parentId'] !== undefined ? Number(record['parentId']) : undefined,
        kind: String(record['kind']),
        label: String(record['label']),
        metadata: (record['metadata'] as Record<string, unknown>) ?? undefined,
      };
      return this.registerNode(node);
    });
  }

  importCsv(content: string): readonly NumericNode[] {
    const records = parseCsv(content);
    return records.map((record) => {
      const node: NumericNodeInput = {
        id: Number(record['id']),
        parentId: record['parentId'] ? Number(record['parentId']) : undefined,
        kind: record['kind'],
        label: record['label'],
        metadata: record['metadata'] ? JSON.parse(record['metadata']) : undefined,
      };
      return this.registerNode(node);
    });
  }

  exportJson(): string {
    return JSON.stringify(Array.from(this.nodes.values()), null, 2);
  }

  exportJsonLd(): string {
    return JSON.stringify(
      Array.from(this.nodes.values()).map((node) => ({
        '@id': node.id,
        'parentId': node.parentId,
        'kind': node.kind,
        'label': node.label,
        'path': node.path,
        'metadata': node.metadata,
      })),
      null,
      2,
    );
  }

  exportCsv(): string {
    const escapeValue = (value: string): string => {
      const escaped = value.replace(/"/g, '""');
      return escaped.includes(',') || escaped.includes('"') || escaped.includes('\n') ? `"${escaped}"` : escaped;
    };

    const lines = ['id,parentId,kind,label,metadata'];
    this.nodes.forEach((node) => {
      const metadata = node.metadata ? JSON.stringify(node.metadata) : '';
      lines.push(
        [
          node.id.toString(),
          node.parentId?.toString() ?? '',
          escapeValue(node.kind),
          escapeValue(node.label),
          metadata ? escapeValue(metadata) : '',
        ].join(','),
      );
    });
    return lines.join('\n');
  }
}
