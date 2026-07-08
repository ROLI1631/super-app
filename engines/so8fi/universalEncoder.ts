import { JournalWriter } from '../../core/journal';
import { So8fiCodeEngine, So8fiEncodeInput } from './so8fiCodeEngine';

export interface UniversalEncoderStorageResult {
  readonly journalId: number;
  readonly code: string;
}

export class UniversalEncoder {
  constructor(
    private readonly journal: JournalWriter,
    private readonly codeEngine: So8fiCodeEngine,
  ) {}

  encodeAndStore(input: So8fiEncodeInput): UniversalEncoderStorageResult {
    const code = this.codeEngine.encode(input);
    const decoded = this.codeEngine.decode(code);

    const entry = this.journal.append({
      coordinate: decoded.coordinate,
      so8fiCode: code,
      identityId: decoded.identityId,
      protocol: decoded.protocol,
      hash: decoded.hash,
      signature: `sig:${decoded.hash}`,
      version: decoded.version,
    });

    return {
      journalId: entry.id,
      code,
    };
  }
}
