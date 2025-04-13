import { Bit } from "../types/bit";
import { Instruction } from "../types/instruction";

enum ULAOperations {
  AND = 0,
  OR = 1,
  XOR = 2,
  ADD = 3,
}

export class ULA {
  exec(instr: Instruction, A: Bit, B: Bit, carryIn: Bit): { S: Bit; carryOut: Bit } {
    // aplica o controle ENA (enable A): se A for habilitado, usa A, senão usa 0
    let a = instr.ENA ? A : 0;

    // aplica o controle INVA (inverter A): se A for habilitado, inverte A
    a = instr.INVA ? ((a ^ 1) as Bit) : a;

    // aplica o controle ENB (enable B): se B for habilitado, usa B, senão usa 0
    let b = instr.ENB ? B : 0;

    let S: Bit = 0;
    let carryOut: Bit = 0;

    // decodifica a operação a ser realizada
    let op = this.getOperation(instr);

    // executa a operação
    switch (op) {
      case ULAOperations.AND:
        S = this.and(a, b);
        break;
      case ULAOperations.OR:
        S = this.or(a, b);
        break;
      case ULAOperations.XOR:
        S = this.xor(a, b);
        break;
      case ULAOperations.ADD:
        const result = this.add(a, b, instr.INC, carryIn);
        S = result.S;
        carryOut = result.carryOut;
        break;
    }

    return { S, carryOut };
  }

  private getOperation(instr: Instruction): ULAOperations {
    if (instr.F0 === 0 && instr.F1 === 0) return ULAOperations.AND;
    else if (instr.F0 === 0 && instr.F1 === 1) return ULAOperations.OR;
    else if (instr.F0 === 1 && instr.F1 === 0) return ULAOperations.XOR;
    else return ULAOperations.ADD;
  }

  private and(a: Bit, b: Bit): Bit {
    return (a & b) as Bit;
  }
  private or(a: Bit, b: Bit): Bit {
    return (a | b) as Bit;
  }

  private xor(a: Bit, b: Bit): Bit {
    return (a ^ b) as Bit;
  }

  private add(a: Bit, b: Bit, inc: Bit, carryIn: Bit): { S: Bit; carryOut: Bit } {
    // Se INC está ativo, B é forçado a 1, ignorando o valor real de B
    const realB = inc ? 1 : b;

    // Soma: A + realB + carryIn
    const sum = a ^ realB ^ carryIn; // XOR para resultado do bit
    const carryOut = (a & realB) | (a & carryIn) | (realB & carryIn); // lógica de carry do full adder

    return { S: sum as Bit, carryOut: carryOut as Bit }; // retorna o resultado e o carry out
  }
}

export class ULA32 {
  private ula1bit = new ULA();

  exec(
    instr: Instruction,
    A: Bit[],
    B: Bit[]
  ): {
    S: Bit[];
    Z: Bit;
    N: Bit;
    SD: Bit[];
    CO: Bit;
  } {
    if (A.length !== 32 || B.length !== 32) {
      throw new Error("invalid size of A or B");
    }

    if (instr.SLL8 && instr.SRA1) {
      throw new Error("invalid control signals.");
    }

    let S: Bit[] = Array(32).fill(0) as Bit[];
    let carry = 0 as Bit;

    console.log(instr);

    for (let i = 0; i < 32; i++) {
      const result = this.ula1bit.exec(instr, A[i], B[i], carry);
      S[i] = result.S;
      carry = result.carryOut;
    }

    let SD = S;

    if (instr.SLL8) {
      SD = this.leftShift(S);
    }

    if (instr.SRA1) {
      SD = this.rightShift(S);
    }

    // Verifica se o resultado é zero
    const Z = SD.every((bit) => bit === 0) ? 1 : 0;
    // Verifica se o resultado é negativo (bit mais significativo)
    const N = SD[31] === 1 ? 1 : 0;

    return { S, SD, Z, N, CO: carry };
  }

  private leftShift(S: Bit[]): Bit[] {
    // Retorna os 24 bits mais significativos e adiciona 8 bits 0 no final
    return [...S.slice(8, 32), ...Array(8).fill(0)];
  }
  private rightShift(S: Bit[]): Bit[] {
    // deslocamento aritmético para a direita de 1 bit
    return [S[0], ...S.slice(0, 31)];
  }
}
