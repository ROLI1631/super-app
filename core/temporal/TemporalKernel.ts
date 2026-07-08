import { Coordinate } from './Coordinate';
import { DEFAULT_TEMPORAL_CONFIG, TemporalConfig } from './TemporalConfig';
import { Gear } from './Gear';
import { GearChain } from './GearChain';
import { TemporalValidator } from './TemporalValidator';

export interface TemporalKernel {
  next(identityId: number): Coordinate;
  peek(): string;
  validateCoordinate(value: string): boolean;
  version(): string;
}

export class DefaultTemporalKernel implements TemporalKernel {
  private chain: GearChain;
  private readonly config: TemporalConfig;
  private readonly validator: TemporalValidator;
  private lastCoordinate?: Coordinate;

  constructor(
    config: TemporalConfig = DEFAULT_TEMPORAL_CONFIG,
    validator = new TemporalValidator(),
    initialCoordinate?: string,
  ) {
    this.config = config;
    this.validator = validator;

    const initialValues = this.parseInitialCoordinate(initialCoordinate);
    const gears = config.capacities.map((capacity, index) => new Gear(capacity, initialValues[index]));
    this.validator.validateGearChain(gears, config.capacities);
    this.chain = new GearChain(gears, config.widths);
  }

  private parseInitialCoordinate(value?: string): number[] {
    if (!value) {
      return [0, 0, 0, 0, 0, 0, 0, 0];
    }

    if (!this.validator.validateCoordinate(value, this.config.widths)) {
      throw new Error(`Invalid initial temporal coordinate: ${value}`);
    }

    return value.split('.').map((part) => Number.parseInt(part, 10));
  }

  next(identityId: number): Coordinate {
    this.chain = this.chain.next();
    const coordinate = new Coordinate(identityId, this.chain.values(), this.config.widths);
    this.validator.validateMonotonicOrder(this.lastCoordinate, coordinate);
    this.lastCoordinate = coordinate;
    return coordinate;
  }

  peek(): string {
    return this.chain.serialize();
  }

  validateCoordinate(value: string): boolean {
    return this.validator.validateCoordinate(value, this.config.widths);
  }

  version(): string {
    return this.config.version;
  }
}
