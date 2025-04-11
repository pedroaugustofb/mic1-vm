import { Bit } from "../types/bit";
import { Instruction } from "../types/instruction";
import { Logger } from "./logger";
import { Register } from "./register";
import { ULA32 } from "./ula";

export default class Mic1VM {
  private pc: number = -1; // Program Counter
  private ula = new ULA32();
  private regs = {
    IR: new Register(8), // Instruction Register
  };

  private logger = new Logger();

  run(program: string[]) {
    // 32 bits
    const A: Bit[] = new Array(31).fill(0).concat(1);
    const B: Bit[] = [1, ...new Array(31).fill(0)];

    while (true) {
      try {
        // incrementa o PC
        this.pc++;

        // verifica se o PC está dentro do tamanho do programa
        if (this.pc >= program.length) {
          this.logger.empty({ PC: this.pc + 1 });
          break;
        }

        // salva a instrução no registrador de instrução
        this.regs.IR.write(program[this.pc].split("").map(Number) as Bit[]);

        const instr = this.parseInstruction(program[this.pc]);

        const { S, CO, N, SD, Z } = this.ula.exec(instr, A, B);

        this.logger.log({ PC: this.pc + 1, IR: this.regs.IR, A, B, S, CO, N, SD, Z });
      } catch (error: any) {
        this.logger.error({
          message: error.message,
          PC: this.pc + 1,
          IR: this.regs.IR,
        });
      }
    }
  }

  private parseInstruction(line: string): Instruction {
    if (line.length !== 8 || /[^01]/.test(line)) {
      throw new Error(`invalid instrucion at line ${line}`);
    }

    const bits = line.split("").map(Number) as Bit[];

    let instr: Instruction = {
      SLL8: bits[0],
      SRA1: bits[1],
      ENA: bits[2],
      INVA: bits[3],
      ENB: bits[4],
      INC: bits[5],
      F0: bits[6],
      F1: bits[7],
    };

    return instr;
  }
}
