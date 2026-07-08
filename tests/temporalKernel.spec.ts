import { createTemporalKernel } from '../core/temporal/TemporalFactory';
import { Coordinate } from '../core/temporal/Coordinate';
import { Gear } from '../core/temporal/Gear';
import { GearChain } from '../core/temporal/GearChain';
import { TemporalValidator } from '../core/temporal/TemporalValidator';
import { DefaultTemporalKernel } from '../core/temporal/TemporalKernel';
import { DEFAULT_TEMPORAL_CONFIG } from '../core/temporal/TemporalConfig';

describe('Temporal Kernel SAS-TIME-100', () => {
  it('creates immutable coordinates in strict G1..G8 format', () => {
    const kernel = createTemporalKernel();
    const coordinate = kernel.next(1);

    expect(coordinate.serialize()).toMatch(/^\d{4}\.\d{4}\.\d{3}\.\d{2}\.\d{2}\.\d{2}\.\d{2}\.\d{4}$/);
    expect(Object.isFrozen(coordinate)).toBe(true);
  });

  it('keeps monotonic order and unique hashes', () => {
    const kernel = createTemporalKernel();
    const first = kernel.next(1);
    const second = kernel.next(1);

    expect(second.compare(first)).toBeGreaterThan(0);
    expect(second.hash()).not.toBe(first.hash());
  });

  it('validates gear chain and coordinate format', () => {
    const validator = new TemporalValidator();
    const capacities = [10000, 10000, 364, 24, 60, 60, 100, 1000];
    const widths = [4, 4, 3, 2, 2, 2, 2, 4];
    const chain = new GearChain(capacities.map((c) => new Gear(c)), widths);

    validator.validateGearChain(chain.gearState(), capacities);
    expect(validator.validateCoordinate(chain.next().serialize(), widths)).toBe(true);
  });

  it('rejects invalid gear and coordinate values', () => {
    expect(() => new Gear(0)).toThrow();
    expect(() => new Gear(10, 10)).toThrow();
    expect(() => new GearChain([new Gear(1)], [1])).toThrow();

    const validator = new TemporalValidator();
    const capacities = [10000, 10000, 364, 24, 60, 60, 100, 1000];
    expect(() => validator.validateGearChain([new Gear(10000)], capacities)).toThrow();
    expect(validator.validateCoordinate('1.2.3', [4, 4, 3, 2, 2, 2, 2, 4])).toBe(false);
    expect(validator.validateCoordinate('0000.0000.A01.00.00.00.00.0001', [4, 4, 3, 2, 2, 2, 2, 4])).toBe(false);
  });

  it('supports coordinate equality, compare, and hash determinism', () => {
    const a = new Coordinate(1, [0, 0, 1, 0, 0, 0, 0, 1], [4, 4, 3, 2, 2, 2, 2, 4]);
    const b = new Coordinate(1, [0, 0, 1, 0, 0, 0, 0, 2], [4, 4, 3, 2, 2, 2, 2, 4]);
    const c = new Coordinate(1, [0, 0, 1, 0, 0, 0, 0, 1], [4, 4, 3, 2, 2, 2, 2, 4]);

    expect(a.compare(b)).toBeLessThan(0);
    expect(a.equals(c)).toBe(true);
    expect(a.hash()).toBe(c.hash());
    expect(a.values()).toEqual([0, 0, 1, 0, 0, 0, 0, 1]);
  });

  it('enforces monotonic validator and kernel version/peek helpers', () => {
    const validator = new TemporalValidator();
    const previous = new Coordinate(1, [0, 0, 1, 0, 0, 0, 0, 5], [4, 4, 3, 2, 2, 2, 2, 4]);
    const current = new Coordinate(1, [0, 0, 1, 0, 0, 0, 0, 4], [4, 4, 3, 2, 2, 2, 2, 4]);
    expect(() => validator.validateMonotonicOrder(previous, current)).toThrow();

    const kernel = new DefaultTemporalKernel(DEFAULT_TEMPORAL_CONFIG, validator);
    expect(kernel.version()).toBe('SAS-TIME-100.v1.0');
    expect(kernel.peek()).toBe('0000.0000.000.00.00.00.00.0000');
    expect(kernel.validateCoordinate('0000.0000.001.00.00.00.00.0001')).toBe(true);
  });

  it('covers gear overflow and validator mismatch branches', () => {
    const noOverflow = new Gear(10, 1);
    expect(noOverflow.overflow()).toBe(false);
    expect(noOverflow.next().currentValue).toBe(2);

    const overflow = new Gear(2, 1);
    expect(overflow.overflow()).toBe(true);
    expect(overflow.next().currentValue).toBe(0);

    const validator = new TemporalValidator();
    expect(() => validator.validateGearChain([new Gear(9), new Gear(9), new Gear(9), new Gear(9), new Gear(9), new Gear(9), new Gear(9), new Gear(9)], [1, 2, 3, 4, 5, 6, 7, 8])).toThrow();
  });

  it('covers coordinate constructor and compare identity branches', () => {
    expect(() => new Coordinate(0, [0, 0, 0, 0, 0, 0, 0, 0], [4, 4, 3, 2, 2, 2, 2, 4])).toThrow();
    expect(() => new Coordinate(1, [0], [4])).toThrow();

    const a = new Coordinate(1, [0, 0, 1, 0, 0, 0, 0, 9], [4, 4, 3, 2, 2, 2, 2, 4]);
    const b = new Coordinate(2, [0, 0, 1, 0, 0, 0, 0, 9], [4, 4, 3, 2, 2, 2, 2, 4]);
    expect(a.compare(b)).toBeLessThan(0);
  });
});
