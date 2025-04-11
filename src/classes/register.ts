import { Bit } from "../types/bit";

export class Register {
  private value: Bit[];

  constructor(size: number, initialValue?: Bit[]) {
    this.value = new Array(size).fill(0);

    if (initialValue) {
      for (let i = 0; i < Math.min(size, initialValue.length); i++) {
        this.value[i] = initialValue[i];
      }
    }
  }

  read(): Bit[] {
    return [...this.value];
  }

  write(newValue: Bit[]): void {
    if (newValue.length !== this.value.length) {
      throw new Error("invalid register value size");
    }
    this.value = [...newValue];
  }
}
