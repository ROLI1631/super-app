import { Coordinate } from './Coordinate';
import { Gear } from './Gear';

export class TemporalValidator {
  validateGearChain(gears: readonly Gear[], capacities: readonly number[]): void {
    if (gears.length !== 8 || capacities.length !== 8) {
      throw new Error('Temporal gear chain must contain exactly 8 gears');
    }

    gears.forEach((gear, index) => {
      gear.validate();
      if (gear.capacity !== capacities[index]) {
        throw new Error(`Temporal gear capacity mismatch at index ${index}`);
      }
    });
  }

  validateCoordinate(value: string, widths: readonly number[]): boolean {
    const parts = value.split('.');
    if (parts.length !== 8 || widths.length !== 8) {
      return false;
    }

    return parts.every((part, index) => {
      if (!/^\d+$/.test(part)) {
        return false;
      }

      return part.length === widths[index];
    });
  }

  validateMonotonicOrder(previous: Coordinate | undefined, current: Coordinate): void {
    if (!previous) {
      return;
    }

    if (current.compare(previous) <= 0) {
      throw new Error('Temporal coordinate order violation');
    }
  }
}
