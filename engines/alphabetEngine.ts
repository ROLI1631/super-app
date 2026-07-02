import { LanguageCode, Metadata, NumericId } from '../core/types';

export interface DictionaryEntry {
  readonly word: string;
  readonly canonical: string;
  readonly language: LanguageCode;
  readonly numericId: NumericId;
  readonly metadata?: Metadata;
}

export interface AlphabetEngine {
  readonly supportedLanguages: readonly LanguageCode[];
  normalizeText(value: string, language: LanguageCode): string;
  normalizeWord(value: string, language: LanguageCode): string;
  detectLanguage(value: string): LanguageCode;
  getSynonyms(value: string, language: LanguageCode): readonly string[];
  lookupDictionary(value: string, language: LanguageCode): DictionaryEntry | undefined;
  textToNumericId(value: string, language: LanguageCode): NumericId;
  textToTokenIds(value: string, language: LanguageCode): readonly NumericId[];
  wordToNumericId(value: string, language: LanguageCode): NumericId;
  parsePhrases(value: string, language: LanguageCode): PhraseNode[];
  buildSearchGraph(value: string, language: LanguageCode): SearchGraph;
}

export interface PhraseNode {
  readonly token: string;
  readonly numericId: NumericId;
  readonly canonical?: string;
  readonly children: readonly PhraseNode[];
}

export interface SearchGraphNode {
  readonly token: string;
  readonly numericId: NumericId;
  readonly canonicalNumericId?: NumericId;
  readonly synonyms?: readonly string[];
}

export interface SearchGraph {
  readonly nodes: readonly SearchGraphNode[];
  readonly edges: readonly [NumericId, NumericId][]; // adjacency between numeric ids
}
