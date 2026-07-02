import { CatalogRegistry, CatalogObject, CategoryNode, SearchMetadata } from './catalog';
import { NumericId, Timestamp } from '../core/types';
import { InMemoryNumericUniverse } from './numericUniverseImpl';
import { AlphabetEngine } from './alphabetEngine';

function nowIso(): Timestamp {
  return new Date().toISOString();
}

export class InMemoryCatalog implements CatalogRegistry {
  private categories = new Map<NumericId, CategoryNode>();
  private objects = new Map<NumericId, CatalogObject>();
  private children = new Map<NumericId, NumericId[]>();

  constructor(private readonly idGenerator: () => NumericId, private readonly alphabet?: AlphabetEngine, private readonly universe?: InMemoryNumericUniverse) {}

  registerCategory(label: string, parentId?: NumericId, metadata?: Record<string, unknown>): CategoryNode {
    const id = this.idGenerator();
    const depth = parentId ? (this.categories.get(parentId)?.depth ?? 0) + 1 : 0;
    const node: CategoryNode = { id, parentId, label, depth, metadata };
    this.categories.set(id, node);
    if (parentId) {
      const list = this.children.get(parentId) ?? [];
      list.push(id);
      this.children.set(parentId, list);
    }
    return node;
  }

  getCategory(id: NumericId): CategoryNode | undefined {
    return this.categories.get(id);
  }

  listCategories(parentId?: NumericId): readonly CategoryNode[] {
    if (parentId === undefined) return Array.from(this.categories.values());
    const list = this.children.get(parentId) ?? [];
    return list.map((id) => this.categories.get(id)!).filter(Boolean);
  }

  registerObject(obj: Omit<CatalogObject, 'id' | 'createdAt' | 'updatedAt'>): CatalogObject {
    const id = this.idGenerator();
    const item: CatalogObject = {
      ...obj,
      id,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };

    // build search metadata if alphabet engine provided
    if (this.alphabet) {
      const text = [item.title, item.description].filter(Boolean).join(' ');
      const lang = item.language ?? this.alphabet.detectLanguage(text || '');
      const tokens = this.alphabet.textToTokenIds(text || '', lang);
      const alphaTokens = text ? text.split(/\s+/).filter(Boolean) : [];
      const searchMeta: SearchMetadata = {
        numericTokens: tokens,
        alphabetTokens: alphaTokens,
        synonyms: [],
        languageVariants: [lang],
        searchGraph: this.alphabet.buildSearchGraph(text || '', lang),
        phraseTree: this.alphabet.parsePhrases(text || '', lang),
      };
      (item as any).search = searchMeta;
    }

    this.objects.set(id, item);
    // index in category children mapping
    if (obj.categoryId) {
      const list = this.children.get(obj.categoryId) ?? [];
      list.push(id);
      this.children.set(obj.categoryId, list);
    }

    return item;
  }

  findById(id: NumericId) {
    return this.objects.get(id);
  }

  findByCategory(categoryId: NumericId) {
    const ids = this.children.get(categoryId) ?? [];
    return ids.map((id) => this.objects.get(id)!).filter(Boolean);
  }

  search(query: string, language?: string) {
    const lang = language ?? (this.alphabet ? this.alphabet.detectLanguage(query) : 'en');
    const qtokens = this.alphabet ? this.alphabet.textToTokenIds(query, lang) : [];

    const results: CatalogObject[] = [];
    this.objects.forEach((obj) => {
      const meta = obj.search;
      if (!meta) return;
      const overlap = (meta.numericTokens ?? []).some((t) => qtokens.includes(t));
      if (overlap) results.push(obj);
    });

    return results;
  }

  discoverAttributes(categoryId: NumericId) {
    const objs = this.findByCategory(categoryId);
    const set = new Set<string>();
    objs.forEach((o) => {
      if (o.attributes) Object.keys(o.attributes).forEach((k) => set.add(k));
    });
    return Array.from(set);
  }
}
