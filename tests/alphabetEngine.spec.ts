import { SimpleAlphabetEngine } from '../engines/alphabetEngineImpl';
import { InMemoryNumericUniverse } from '../engines/numericUniverseImpl';

describe('SimpleAlphabetEngine', () => {
  const numericUniverse = new InMemoryNumericUniverse();
  numericUniverse.registerNode({ id: 1000, kind: 'concept', label: 'automobile' });
  numericUniverse.registerNode({ id: 2000, kind: 'concept', label: 'home' });

  const engine = new SimpleAlphabetEngine(['en', 'es'], numericUniverse);

  it('normalizes text (diacritics and spacing)', () => {
    expect(engine.normalizeText('  Café—Rojo  ', 'es')).toBe('cafe rojo');
  });

  it('detects language heuristically', () => {
    expect(engine.detectLanguage('hola amigo')).toBe('es');
    expect(engine.detectLanguage('hello friend')).toBe('en');
  });

  it('resolves synonyms and canonical concepts', () => {
    const synonyms = engine.getSynonyms('car', 'en');
    expect(synonyms).toContain('car');
    expect(engine.lookupDictionary('car', 'en')?.canonical).toBe('automobile');
  });

  it('generates numeric ids for words and falls back for unknowns', () => {
    const idKnown = engine.wordToNumericId('car', 'en');
    expect(typeof idKnown).toBe('number');

    const idFromUniverse = engine.wordToNumericId('automobile', 'en');
    expect(idFromUniverse).toBe(1000);

    const idUnknown = engine.wordToNumericId('qwertyuiop', 'en');
    expect(typeof idUnknown).toBe('number');
    expect(idUnknown).not.toBeNaN();
  });

  it('parses phrases into phrase trees', () => {
    const tree = engine.parsePhrases('red car fast', 'en');
    expect(tree.length).toBeGreaterThan(0);
    // root should contain token 'red'
    expect(tree[0].token).toBe('red');
    // subsequent children should exist
    expect(tree[0].children[0].token).toBe('car');
  });

  it('builds a search graph with nodes and edges', () => {
    const graph = engine.buildSearchGraph('red car', 'en');
    expect(graph.nodes.length).toBeGreaterThanOrEqual(2);
    expect(graph.edges.length).toBeGreaterThanOrEqual(1);
  });
});

describe('Event Pipeline integration', () => {
  const { createDefaultInfrastructureServices } = require('../infrastructure/factory');

  it('enriches events with alphabet metadata for all strings recursively', async () => {
    const services = createDefaultInfrastructureServices();
    const payload = {
      title: 'Cheap car',
      description: 'A red auto',
      tags: ['auto', 'vehicle'],
      nested: { note: 'home sweet home', arr: [{ msg: 'hello' }] },
    };

    const received: any[] = [];
    const promise = new Promise<void>((resolve) => {
      services.eventBus.subscribe('core.event.processed', (m: any) => {
        received.push(m.payload);
        resolve();
      });
    });

    await services.apiGateway.dispatch({
      action: 'test.alphabet',
      payload,
      userId: 1,
      sessionId: 1,
      containerId: 1,
      moduleId: 1,
    });

    await promise;

    expect(received.length).toBeGreaterThanOrEqual(1);

    const processed = received[received.length - 1];
    const meta = processed?.metadata;
    expect(meta).toBeDefined();
    expect((meta as any).alphabet).toBeDefined();
  });
});
