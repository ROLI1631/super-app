import { InMemoryJournal } from '../core/journalImpl';
import { DefaultSo8fiCodeEngine } from '../engines/so8fi/so8fiCodeEngineImpl';
import { UniversalEncoder } from '../engines/so8fi/universalEncoder';
import { UniversalDecoder } from '../engines/so8fi/universalDecoder';

describe('SO8FI Code Engine', () => {
  it('encodes and decodes immutable envelopes for any digital object', () => {
    const engine = new DefaultSo8fiCodeEngine();
    const code = engine.encode({
      identityId: 10,
      coordinate: '0000.0000.001.00.00.00.00.0001',
      protocol: 'user.register',
      kind: 'Identity',
      payload: { handle: 'so8fi' },
    });

    expect(code.startsWith('SO8FI.')).toBe(true);
    expect(engine.isValid(code)).toBe(true);

    const decoded = engine.decode(code);
    expect(decoded.identityId).toBe(10);
    expect(decoded.protocol).toBe('user.register');
    expect(decoded.kind).toBe('Identity');
  });

  it('executes universal encoder and decoder flow against Journal', () => {
    const journal = new InMemoryJournal();
    const engine = new DefaultSo8fiCodeEngine();
    const encoder = new UniversalEncoder(journal, engine);
    const decoder = new UniversalDecoder(journal, engine);

    const stored = encoder.encodeAndStore({
      identityId: 20,
      coordinate: '0000.0000.010.00.00.00.00.0010',
      protocol: 'marketplace.createListing',
      kind: 'BusinessObject',
      payload: { title: 'Listing A' },
    });

    const humanReadable = decoder.decodeFromJournal(stored.journalId);
    expect(humanReadable.coordinate).toBe('0000.0000.010.00.00.00.00.0010');
    expect(humanReadable.protocol).toBe('marketplace.createListing');
    expect(humanReadable.payload).toEqual({ title: 'Listing A' });
  });

  it('rejects invalid prefixes and tampered payloads', () => {
    const engine = new DefaultSo8fiCodeEngine();
    expect(() => engine.decode('INVALID.CODE')).toThrow();

    const code = engine.encode({
      identityId: 10,
      coordinate: '0000.0000.001.00.00.00.00.0001',
      protocol: 'user.register',
      kind: 'Identity',
      payload: { handle: 'so8fi' },
    });

    const tampered = `${code}x`;
    expect(engine.isValid(tampered)).toBe(false);
  });

  it('fails universal decoder when journal entry does not exist', () => {
    const journal = new InMemoryJournal();
    const engine = new DefaultSo8fiCodeEngine();
    const decoder = new UniversalDecoder(journal, engine);

    expect(() => decoder.decodeFromJournal(999)).toThrow();
  });

  it('supports canonical hashing for array payloads', () => {
    const engine = new DefaultSo8fiCodeEngine();
    const code = engine.encode({
      identityId: 33,
      coordinate: '0000.0000.099.00.00.00.00.0099',
      protocol: 'media.upload',
      kind: 'AnyDigitalObject',
      payload: [{ name: 'file-a' }, { name: 'file-b' }],
    });

    const decoded = engine.decode(code);
    expect(decoded.kind).toBe('AnyDigitalObject');
    expect(engine.isValid(code)).toBe(true);
  });
});
