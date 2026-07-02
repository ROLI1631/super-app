import { AlphabetEngine, DictionaryEntry, PhraseNode, SearchGraph, SearchGraphNode } from './alphabetEngine';
import { LanguageCode, Metadata, NumericId } from '../core/types';
import { NumericUniverseRegistry } from './numericUniverse';

const normalizationPattern = /[^A-Za-z0-9]+/g;
const languagePatterns: Readonly<Record<LanguageCode, RegExp>> = {
  en: /[A-Za-z]/,
  es: /[ÁÉÍÓÚÑáéíóúñ]/,
  fr: /[ÀÂÇÉÈÊËÎÏÔÛÙÜŸàâçéèêëîïôûùüÿ]/,
  de: /[ÄÖÜßäöü]/,
  ru: /[А-Яа-яЁё]/,
  zh: /[\u4e00-\u9fff]/,
};

function fnv1a32(value: string): number {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = (hash * 16777619) >>> 0;
  }
  return hash === 0 ? 1 : hash;
}

function buildNumericId(value: string, language: LanguageCode): NumericId {
  return fnv1a32(`${language}:${value}`);
}

function deepFreeze<T extends object>(value: T): T {
  Object.freeze(value);
  Object.values(value).forEach((child) => {
    if (typeof child === 'object' && child !== null && !Object.isFrozen(child)) {
      deepFreeze(child as T);
    }
  });
  return value;
}

const defaultDictionary: readonly DictionaryEntry[] = [
  { word: 'car', canonical: 'automobile', language: 'en', numericId: buildNumericId('automobile', 'en'), metadata: { category: 'vehicle' } },
  { word: 'automobile', canonical: 'automobile', language: 'en', numericId: buildNumericId('automobile', 'en'), metadata: { category: 'vehicle' } },
  { word: 'auto', canonical: 'automobile', language: 'en', numericId: buildNumericId('automobile', 'en'), metadata: { category: 'vehicle' } },
  { word: 'house', canonical: 'home', language: 'en', numericId: buildNumericId('home', 'en'), metadata: { category: 'property' } },
  { word: 'home', canonical: 'home', language: 'en', numericId: buildNumericId('home', 'en'), metadata: { category: 'property' } },
  { word: 'casa', canonical: 'casa', language: 'es', numericId: buildNumericId('casa', 'es'), metadata: { category: 'property' } },
  { word: 'voiture', canonical: 'voiture', language: 'fr', numericId: buildNumericId('voiture', 'fr'), metadata: { category: 'vehicle' } },
];

function mapDictionary(entries: readonly DictionaryEntry[]): Map<LanguageCode, Map<string, DictionaryEntry>> {
  const dictionary = new Map<LanguageCode, Map<string, DictionaryEntry>>();

  entries.forEach((entry) => {
    const languageMap = dictionary.get(entry.language) ?? new Map();
    languageMap.set(entry.word, entry);
    dictionary.set(entry.language, languageMap);
  });

  return dictionary;
}

function buildSynonymIndex(entries: readonly DictionaryEntry[]): Map<LanguageCode, Map<string, string>> {
  const synonyms = new Map<LanguageCode, Map<string, string>>();

  entries.forEach((entry) => {
    const languageMap = synonyms.get(entry.language) ?? new Map();
    const base = entry.canonical;
    languageMap.set(entry.word, base);
    synonyms.set(entry.language, languageMap);
  });

  return synonyms;
}

export class SimpleAlphabetEngine implements AlphabetEngine {
  readonly supportedLanguages: readonly LanguageCode[];
  private readonly dictionary: Map<LanguageCode, Map<string, DictionaryEntry>>;
  private readonly synonymIndex: Map<LanguageCode, Map<string, string>>;
  private readonly numericUniverse?: NumericUniverseRegistry;

  constructor(supportedLanguages: readonly LanguageCode[] = ['en'], numericUniverse?: NumericUniverseRegistry) {
    this.supportedLanguages = supportedLanguages;
    this.dictionary = mapDictionary(defaultDictionary);
    this.synonymIndex = buildSynonymIndex(defaultDictionary);
    this.numericUniverse = numericUniverse;
  }

  normalizeText(value: string, language: LanguageCode): string {
    const normalized = value.normalize('NFKD').replace(normalizationPattern, ' ').trim().toLowerCase();
    return normalized.replace(/\s+/g, ' ');
  }

  normalizeWord(value: string, language: LanguageCode): string {
    return this.normalizeText(value, language);
  }

  detectLanguage(value: string): LanguageCode {
    const tokens = value.toLowerCase().split(/\s+/).filter(Boolean);

    const languageStopwords: Record<LanguageCode, string[]> = {
      en: ['the', 'and', 'hello', 'friend'],
      es: ['hola', 'amigo', 'gracias', 'por', 'favor', 'casa', 'auto'],
      fr: ['bonjour', 'merci'],
      de: ['hallo'],
    };

    // Check stopwords first
    for (const lang of this.supportedLanguages) {
      const words = languageStopwords[lang] ?? [];
      if (tokens.some((t) => words.includes(t))) return lang;
    }

    // Fallback to character patterns, pick the language with most matches
    let best: LanguageCode = this.supportedLanguages[0] ?? 'en';
    let bestScore = 0;
    for (const language of this.supportedLanguages) {
      const pattern = languagePatterns[language];
      if (!pattern) continue;
      const matches = (value.match(new RegExp(pattern, 'g')) || []).length;
      if (matches > bestScore) {
        bestScore = matches;
        best = language;
      }
    }

    return best;
  }

  getSynonyms(value: string, language: LanguageCode): readonly string[] {
    const normalized = this.normalizeWord(value, language);
    const languageMap = this.synonymIndex.get(language);
    if (!languageMap) {
      return [];
    }

    const canonical = languageMap.get(normalized) ?? normalized;
    return Array.from(languageMap.entries())
      .filter(([, base]) => base === canonical)
      .map(([word]) => word);
  }

  lookupDictionary(value: string, language: LanguageCode): DictionaryEntry | undefined {
    const normalized = this.normalizeWord(value, language);
    return this.dictionary.get(language)?.get(normalized);
  }

  wordToNumericId(value: string, language: LanguageCode): NumericId {
    const normalized = this.normalizeWord(value, language);
    const synonyms = this.getSynonyms(normalized, language);
    const canonical = synonyms.length > 0 ? synonyms[0] : normalized;
    // Prefer existing Numeric Universe node if available
    if (this.numericUniverse) {
      try {
        const json = this.numericUniverse.exportJson();
        const nodes = JSON.parse(json) as Array<Record<string, unknown>>;
        const found = nodes.find((n) => String(n.label).toLowerCase() === canonical.toLowerCase());
        if (found && typeof found['id'] === 'number') {
          return found['id'] as number;
        }
      } catch (e) {
        // ignore and fallback
      }
    }

    const dictEntry = this.lookupDictionary(normalized, language);
    const canonicalLabel = dictEntry?.canonical ?? (synonyms.length > 0 ? synonyms[0] : normalized);

    // Prefer existing Numeric Universe node if available
    if (this.numericUniverse) {
      try {
        const json = this.numericUniverse.exportJson();
        const nodes = JSON.parse(json) as Array<Record<string, unknown>>;
        const found = nodes.find((n) => String(n.label).toLowerCase() === canonicalLabel.toLowerCase());
        if (found && typeof found['id'] === 'number') {
          return found['id'] as number;
        }
      } catch (e) {
        // ignore and fallback
      }
    }

    if (dictEntry) return dictEntry.numericId;

    return buildNumericId(canonicalLabel, language);
  }

  parsePhrases(value: string, language: LanguageCode): PhraseNode[] {
    const normalized = this.normalizeText(value, language);
    const tokens = normalized.split(' ').filter((t) => t.length > 0);

    const roots: PhraseNode[] = [];

    for (let i = 0; i < tokens.length; i += 1) {
      const build = (start: number): PhraseNode => {
        const token = tokens[start];
        const id = this.wordToNumericId(token, language);
        const children: PhraseNode[] = [];
        if (start + 1 < tokens.length) {
          children.push(build(start + 1));
        }
        return { token, numericId: id, canonical: this.lookupDictionary(token, language)?.canonical, children };
      };

      roots.push(build(i));
    }

    return roots;
  }

  buildSearchGraph(value: string, language: LanguageCode): SearchGraph {
    const phraseNodes = this.parsePhrases(value, language);
    const nodesMap = new Map<NumericId, SearchGraphNode>();
    const edges: [NumericId, NumericId][] = [];

    const addNode = (token: string) => {
      const id = this.wordToNumericId(token, language);
      if (!nodesMap.has(id)) {
        const canonical = this.lookupDictionary(token, language)?.canonical;
        const canonicalId = canonical ? this.wordToNumericId(canonical, language) : undefined;
        const synonyms = this.getSynonyms(token, language);
        nodesMap.set(id, { token, numericId: id, canonicalNumericId: canonicalId, synonyms });
      }
      return id;
    };

    const walk = (node: PhraseNode) => {
      const parentId = addNode(node.token);
      node.children.forEach((child) => {
        const childId = addNode(child.token);
        edges.push([parentId, childId]);
        walk(child);
      });
    };

    phraseNodes.forEach(walk);

    return { nodes: Array.from(nodesMap.values()), edges };
  }

  textToNumericId(value: string, language: LanguageCode): NumericId {
    const normalized = this.normalizeText(value, language);
    const tokens = normalized.split(' ').filter((token) => token.length > 0);
    if (tokens.length === 1) {
      return this.wordToNumericId(tokens[0], language);
    }

    return buildNumericId(tokens.join(':'), language);
  }

  textToTokenIds(value: string, language: LanguageCode): readonly NumericId[] {
    const normalized = this.normalizeText(value, language);
    return normalized
      .split(' ')
      .filter((token) => token.length > 0)
      .map((token) => this.wordToNumericId(token, language));
  }
}
