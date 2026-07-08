export class Gear {
  readonly capacity: number;
  readonly currentValue: number;

  constructor(capacity: number, currentValue = 0) {
    if (!Number.isInteger(capacity) || capacity <= 0) {
      throw new Error(`Invalid gear capacity: ${capacity}`);
    }

    if (!Number.isInteger(currentValue) || currentValue < 0 || currentValue >= capacity) {
      throw new Error(`Invalid gear current value: ${currentValue}`);
    }

    this.capacity = capacity;
    this.currentValue = currentValue;
  }

  next(): Gear {
    const nextValue = this.currentValue + 1;
    if (nextValue >= this.capacity) {
      return new Gear(this.capacity, 0);
    }

    return new Gear(this.capacity, nextValue);
  }

  overflow(): boolean {
    return this.currentValue + 1 >= this.capacity;
  }

  serialize(width: number): string {
    return String(this.currentValue).padStart(width, '0');
  }

  validate(): void {
    if (!Number.isInteger(this.capacity) || this.capacity <= 0) {
      throw new Error(`Invalid gear capacity: ${this.capacity}`);
    }

    if (!Number.isInteger(this.currentValue) || this.currentValue < 0 || this.currentValue >= this.capacity) {
      throw new Error(`Invalid gear current value: ${this.currentValue}`);
    }
  }
}
