import { InMemoryNumericUniverse } from '../engines/numericUniverseImpl';

describe('Numeric Universe', () => {
  it('should register nodes and preserve hierarchy', () => {
    const registry = new InMemoryNumericUniverse();

    registry.registerNode({ id: 1, kind: 'sector', label: 'Commerce' });
    registry.registerNode({ id: 2, parentId: 1, kind: 'category', label: 'Marketplace' });
    registry.registerNode({ id: 3, parentId: 2, kind: 'subcategory', label: 'Products' });
    registry.registerNode({ id: 4, parentId: 3, kind: 'object', label: 'Product A' });

    expect(registry.exists(4)).toBe(true);
    expect(registry.findParent(4)?.id).toBe(3);
    expect(registry.findAncestors(4).map((node) => node.id)).toEqual([1, 2, 3]);
    expect(registry.findChildren(2).map((node) => node.id)).toEqual([3]);
    expect(registry.findPath(4)).toEqual([1, 2, 3, 4]);
  });

  it('should validate missing parent and duplicate ids', () => {
    const registry = new InMemoryNumericUniverse();
    registry.registerNode({ id: 1, kind: 'sector', label: 'Commerce' });
    registry.registerNode({ id: 2, parentId: 1, kind: 'category', label: 'Marketplace' });

    expect(() => registry.registerNode({ id: 2, parentId: 1, kind: 'category', label: 'Duplicate' })).toThrow();
    expect(() => registry.registerNode({ id: 3, parentId: 99, kind: 'subcategory', label: 'Invalid' })).toThrow();
  });

  it('should find descendants and siblings', () => {
    const registry = new InMemoryNumericUniverse();
    registry.registerNode({ id: 1, kind: 'sector', label: 'Commerce' });
    registry.registerNode({ id: 2, parentId: 1, kind: 'category', label: 'Marketplace' });
    registry.registerNode({ id: 3, parentId: 1, kind: 'category', label: 'Payments' });
    registry.registerNode({ id: 4, parentId: 2, kind: 'subcategory', label: 'Products' });

    expect(registry.findDescendants(1).map((node) => node.id)).toEqual([2, 3, 4]);
    expect(registry.findChildren(1).map((node) => node.id)).toEqual([2, 3]);
    expect(registry.findChildren(2).map((node) => node.id)).toEqual([4]);
    expect(registry.findSiblings(2).map((node) => node.id)).toEqual([3]);
    expect(registry.findSiblings(1)).toEqual([]);
  });

  it('should import and export JSON and CSV', () => {
    const registry = new InMemoryNumericUniverse();
    registry.registerNode({ id: 1, kind: 'sector', label: 'Commerce' });
    registry.registerNode({ id: 2, parentId: 1, kind: 'category', label: 'Marketplace', metadata: { source: 'import' } });

    const json = registry.exportJson();
    const loaded = new InMemoryNumericUniverse();
    loaded.importJson(json);
    expect(loaded.exists(2)).toBe(true);
    expect(loaded.findById(2)?.label).toBe('Marketplace');

    const csv = registry.exportCsv();
    const loadedCsv = new InMemoryNumericUniverse();
    loadedCsv.importCsv(csv);
    expect(loadedCsv.exists(2)).toBe(true);
  });
});
