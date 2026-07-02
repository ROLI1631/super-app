import { IdentityCore, IdentityProfile, IdentityResolution } from './identityCore';
import { NumericId, Timestamp } from './types';

export type IdentityIdGenerator = () => NumericId;
export type TimestampProvider = () => Timestamp;

export class InMemoryIdentityCore implements IdentityCore {
  private readonly identities: IdentityProfile[] = [];

  constructor(
    private readonly generateId: IdentityIdGenerator,
    private readonly now: TimestampProvider,
  ) {}

  resolveIdentity(input: string | NumericId): IdentityResolution | undefined {
    const normalizedInput = typeof input === 'string' ? input.trim() : input;

    const byId =
      typeof normalizedInput === 'number'
        ? this.identities.find((identity) => identity.id === normalizedInput)
        : undefined;

    if (byId) {
      return { identity: byId, matchedBy: 'id' };
    }

    if (typeof normalizedInput === 'string') {
      const byHandle = this.identities.find((identity) => identity.handle === normalizedInput);
      if (byHandle) {
        return { identity: byHandle, matchedBy: 'handle' };
      }

      const byAlias = this.identities.find((identity) => identity.alias === normalizedInput);
      if (byAlias) {
        return { identity: byAlias, matchedBy: 'alias' };
      }
    }

    return undefined;
  }

  registerIdentity(identity: Omit<IdentityProfile, 'id' | 'createdAt'>): IdentityProfile {
    const existing = this.identities.find(
      (existingIdentity) =>
        existingIdentity.handle === identity.handle ||
        (identity.alias !== undefined && existingIdentity.alias === identity.alias),
    );

    if (existing) {
      throw new Error(`Identity handle or alias already exists: ${identity.handle}`);
    }

    const profile: IdentityProfile = {
      ...identity,
      id: this.generateId(),
      createdAt: this.now(),
    };

    this.identities.push(profile);
    return profile;
  }

  listIdentities(): readonly IdentityProfile[] {
    return this.identities.slice();
  }
}
