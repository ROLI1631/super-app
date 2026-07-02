import { CatalogRegistry } from '../engines/catalog';
import { NumericId, LanguageCode } from '../core/types';

export class CatalogApi {
  constructor(private readonly catalog: CatalogRegistry) {}

  search(query: string, language?: LanguageCode) {
    return this.catalog.search(query, language);
  }

  getById(id: NumericId) {
    return this.catalog.findById(id);
  }

  getByCategory(categoryId: NumericId) {
    return this.catalog.findByCategory(categoryId);
  }

  getHierarchy(parentId?: NumericId) {
    return this.catalog.listCategories(parentId);
  }

  discoverAttributes(categoryId: NumericId) {
    return this.catalog.discoverAttributes(categoryId);
  }
}
