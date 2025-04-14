import { Bit } from "../types/bit";

export class Register {
  private value: Bit[];
  private label: string;

  constructor(size: number, label: string, initialValue?: Bit[]) {
    this.value = new Array(size).fill(0);
    this.label = label;

    if (!initialValue) return;

    if (initialValue.length > size) {
      throw new Error("initial value exceeds register size");
    }
    for (let i = 0; i < initialValue.length; i++) {
      this.value[i] = initialValue[i];
    }
  }

  getLabel(): string {
    return this.label;
  }

  read(): Bit[] {
    return [...this.value];
  }

  write(newValue: Bit[]): void {
    if (newValue.length !== this.value.length) {
      throw new Error(`invalid register value size ${this.value.length} != ${newValue.length}, ${this.label}`);	
    }
    this.value = [...newValue];
  }
}
