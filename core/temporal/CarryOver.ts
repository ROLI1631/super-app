import { Gear } from './Gear';

export class CarryOver {
  static apply(gears: readonly Gear[], fromIndex: number): Gear[] {
    const out = [...gears];

    for (let index = fromIndex; index >= 0; index -= 1) {
      const nextGear = out[index].next();
      out[index] = nextGear;

      if (nextGear.currentValue !== 0) {
        break;
      }
    }

    return out;
  }
}
