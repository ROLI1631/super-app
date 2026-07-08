import { createHash } from 'crypto';
import { TEMPORAL_SEPARATOR } from './TemporalRules';

export class Coordinate {
  readonly identityId: number;
  private readonly gears: readonly number[];
  private readonly widths: readonly number[];

  constructor(identityId: number, gears: readonly number[], widths: readonly number[]) {
    if (!Number.isInteger(identityId) || identityId <= 0) {
      throw new Error(`Invalid identity id for coordinate: ${identityId}`);
    }

    if (gears.length !== 8 || widths.length !== 8) {
      throw new Error('Coordinate must contain exactly 8 gears and widths');
    }

    this.identityId = identityId;
    this.gears = Object.freeze([...gears]);
    this.widths = Object.freeze([...widths]);
    Object.freeze(this);
  }

  values(): readonly number[] {
    return [...this.gears];
  }

  serialize(): string {
    return this.gears
      .map((value, index) => String(value).padStart(this.widths[index], '0'))
      .join(TEMPORAL_SEPARATOR);
  }

  compare(other: Coordinate): number {
    for (let i = 0; i < this.gears.length; i += 1) {
      if (this.gears[i] < other.gears[i]) {
        return -1;
      }
      if (this.gears[i] > other.gears[i]) {
        return 1;
      }
    }

    if (this.identityId < other.identityId) {
      return -1;
    }

    if (this.identityId > other.identityId) {
      return 1;
    }

    return 0;
  }

  equals(other: Coordinate): boolean {
    return this.compare(other) === 0;
  }

  hash(): string {
    return createHash('sha256').update(`${this.identityId}:${this.serialize()}`).digest('hex');
  }
}
