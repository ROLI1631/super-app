import { CarryOver } from './CarryOver';
import { Gear } from './Gear';

export class GearChain {
  private readonly gears: readonly Gear[];
  private readonly widths: readonly number[];

  constructor(gears: readonly Gear[], widths: readonly number[]) {
    if (gears.length !== 8 || widths.length !== 8) {
      throw new Error('GearChain must contain exactly 8 gears');
    }

    this.gears = Object.freeze([...gears]);
    this.widths = Object.freeze([...widths]);
  }

  values(): readonly number[] {
    return this.gears.map((gear) => gear.currentValue);
  }

  serialize(): string {
    return this.gears.map((gear, index) => gear.serialize(this.widths[index])).join('.');
  }

  next(): GearChain {
    const lastIndex = this.gears.length - 1;
    const nextGears = CarryOver.apply(this.gears, lastIndex);
    return new GearChain(nextGears, this.widths);
  }

  gearState(): readonly Gear[] {
    return [...this.gears];
  }
}
