import { Metadata, NumericId, Timestamp, LanguageCode } from '../core/types';

export type CatalogObjectType =
  | 'product'
  | 'service'
  | 'rental'
  | 'real_estate'
  | 'vehicle'
  | 'job'
  | 'company'
  | 'person'
  | 'organization'
  | 'digital_asset'
  | 'crypto_asset'
  | 'subscription'
  | 'event'
  | 'ai_service'
  | 'document'
  | 'payment_method'
  | 'location'
  | 'marketplace_listing'
  | string;

export interface CatalogObject {
  readonly id: NumericId; // global numeric id
  readonly parentId?: NumericId;
  readonly categoryId?: NumericId;
  readonly subcategoryId?: NumericId;
  readonly containerId?: NumericId;
  readonly kind: CatalogObjectType;
  readonly title?: string;
  readonly description?: string;
  readonly country?: string;
  readonly language?: LanguageCode;
  readonly version?: string;
  readonly visibility?: 'public' | 'private' | 'unlisted';
  readonly status?: 'draft' | 'published' | 'archived';
  readonly ownerId?: NumericId;
  readonly createdAt?: Timestamp;
  readonly updatedAt?: Timestamp;
  readonly attributes?: Readonly<Record<string, unknown>>;
  readonly search?: SearchMetadata;
  readonly metadata?: Metadata;
}

export interface SearchMetadata {
  readonly numericTokens?: readonly NumericId[];
  readonly alphabetTokens?: readonly string[];
  readonly synonyms?: readonly string[];
  readonly languageVariants?: readonly string[];
  readonly searchGraph?: unknown;
  readonly phraseTree?: unknown;
  readonly ranking?: Record<string, unknown>;
}

export interface CategoryNode {
  readonly id: NumericId;
  readonly parentId?: NumericId;
  readonly label: string;
  readonly depth: number;
  readonly metadata?: Metadata;
}

export interface CatalogRegistry {
  registerCategory(label: string, parentId?: NumericId, metadata?: Metadata): CategoryNode;
  getCategory(id: NumericId): CategoryNode | undefined;
  listCategories(parentId?: NumericId): readonly CategoryNode[];

  registerObject(obj: Omit<CatalogObject, 'id' | 'createdAt' | 'updatedAt'>): CatalogObject;
  findById(id: NumericId): CatalogObject | undefined;
  findByCategory(categoryId: NumericId): readonly CatalogObject[];
  search(query: string, language?: LanguageCode): readonly CatalogObject[];
  discoverAttributes(categoryId: NumericId): readonly string[];
}
