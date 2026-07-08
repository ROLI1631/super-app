import { JournalReader } from '../../core/journal';
import { So8fiCodeEngine, So8fiDecodedOutput } from './so8fiCodeEngine';

export interface UniversalDecodedView {
  readonly coordinate: string;
  readonly identityId: number;
  readonly protocol: string;
  readonly objectKind: string;
  readonly payload: unknown;
}

export class UniversalDecoder {
  constructor(
    private readonly journal: JournalReader,
    private readonly codeEngine: So8fiCodeEngine,
  ) {}

  decodeFromJournal(journalId: number): UniversalDecodedView {
    const entry = this.journal.readById(journalId);
    if (!entry) {
      throw new Error(`Journal entry not found: ${journalId}`);
    }

    const decoded: So8fiDecodedOutput = this.codeEngine.decode(entry.so8fiCode);

    return {
      coordinate: decoded.coordinate,
      identityId: decoded.identityId,
      protocol: decoded.protocol,
      objectKind: decoded.kind,
      payload: decoded.payload,
    };
  }
}
