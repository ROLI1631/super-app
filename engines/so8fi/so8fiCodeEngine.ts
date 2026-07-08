export type So8fiObjectKind =
  | 'Identity'
  | 'Coordinate'
  | 'Protocol'
  | 'JournalEntry'
  | 'BusinessObject'
  | 'Document'
  | 'Image'
  | 'Audio'
  | 'Video'
  | 'Location'
  | 'Message'
  | 'Payment'
  | 'Permission'
  | 'Contract'
  | 'LegalEvent'
  | 'Session'
  | 'AnyDigitalObject';

export interface So8fiEncodeInput {
  readonly identityId: number;
  readonly coordinate: string;
  readonly protocol: string;
  readonly kind: So8fiObjectKind;
  readonly payload: unknown;
}

export interface So8fiDecodedOutput extends So8fiEncodeInput {
  readonly hash: string;
  readonly version: string;
}

export interface So8fiCodeEngine {
  encode(input: So8fiEncodeInput): string;
  decode(code: string): So8fiDecodedOutput;
  isValid(code: string): boolean;
}
