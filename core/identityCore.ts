import { EntityKind, Metadata, NumericId, Timestamp } from './types';

export interface IdentityProfile {
  readonly id: NumericId;
  readonly kind: EntityKind;
  readonly handle: string;
  readonly alias?: string;
  readonly createdAt: Timestamp;
  readonly metadata?: Metadata;
}

export interface IdentityResolution {
  readonly identity: IdentityProfile;
  readonly matchedBy: 'id' | 'handle' | 'alias';
}

export interface IdentityCore {
  resolveIdentity(input: string | NumericId): IdentityResolution | undefined;
  registerIdentity(identity: Omit<IdentityProfile, 'id' | 'createdAt'>): IdentityProfile;
  listIdentities(): readonly IdentityProfile[];
}
