import { Bit } from "../types/bit";
import { BusBRegisters } from "../types/busBRegisters";
import { Instruction } from "../types/instruction";
import { Memo } from "../types/memory";
import { Registers } from "../types/registers";
import { ResponseULARegisters } from "../types/responseUlaRegisters";
import { Decoder4 } from "./decoder";
import { LogData, Logger } from "./logger";
import { Memory } from "./memory";
import { Register } from "./register";
import { Selector9 } from "./selector";
import { ULA32 } from "./ula";

export default class Mic1VM {
  private pc: number = -1; // Program Counter
  private ula = new ULA32();
  private decoder = new Decoder4();
  private selector = new Selector9();
  private memory = new Memory();
  private regs: Registers = {
    IR: new Register(23, "IR"), // Instruction Register
    H: new Register(32, "H"), // Hold Register
    OPC: new Register(32, "OPC"), // Old Program Counter Register
    TOS: new Register(32, "TOS"), // Top of Stack Register
    CPP: new Register(32, "CPP"), // Constant Pool Pointer Register
    LV: new Register(32, "LV"), // Local Variable Register
    SP: new Register(
      32,
      "SP",
      "00000000000000000000000000000100".split("").map((bit) => parseInt(bit) as Bit)
    ), // Stack Pointer Register
    PC: new Register(32, "PC"), // Program Counter Register
    MDR: new Register(32, "MDR"), // Memory Data Register
    MAR: new Register(
      32,
      "MAR",
      "00000000000000000000000000000100".split("").map((bit) => parseInt(bit) as Bit)
    ), // Memory Address Register
    MBR: new Register(8, "MBR"), // Memory Buffer Register
  };

  private logger = new Logger();

  async run(program: string[]) {
    await this.memory.setup(program);
    this.logger.freeLog("=====================================================");
    this.logger.freeLog("> Initial memory states");
    this.logger.logMemory(this.memory.get_memory_state());
    this.logger.freeLog("> Initial register states");
    this.logger.logRegisters(this.getRegistersValue());
    this.logger.freeLog("=====================================================");
    this.logger.freeLog("Start of program");
    this.logger.freeLog("=====================================================");

    const A = this.regs.H.read();

    while (true) {
      try {
        const regsBefore = this.getRegistersValue();

        // incrementa o PC
        this.pc++;

        // verifica se o PC está dentro do tamanho do programa
        if (this.pc >= program.length) {
          this.logger.empty({ PC: this.pc + 1 });
          return;
        }

        const instruction = this.memory.read_instruction(this.pc);
        const control = {
          busB: instruction.slice(19, 23),
          memory: instruction.slice(17, 19),
          busC: instruction.slice(8, 17),
          instr: instruction.slice(0, 8),
        };

        // decodifica qual registrador tem acesso ao barramento b
        const busBRegisterIndex = this.decoder.exec(control.busB);

        const BRegister = this.getBusBRegister(busBRegisterIndex);

        let B = BRegister.read();

        if (busBRegisterIndex === BusBRegisters.MBR) {
          let signalBit = B[0];
          B = [...B, ...Array(24).fill(signalBit)];
        }

        if (busBRegisterIndex === BusBRegisters.MBRU) {
          B = [...B, ...Array(24).fill(0)];
        }

        // salva a instrução no registrador de instrução
        this.regs.IR.write(instruction);

        const instr = this.parseInstruction(control.instr);

        const { S, CO, N, SD, Z } = this.ula.exec(instr, A, B);

        // pegar os registradores habilitados
        const busCRegisters = this.getBusCRegisters(control.busC);

        // escreve os registradores habilitados
        for (const register of busCRegisters) {
          register.write(SD);
        }

        const memo: Memo = {
          X0: control.memory[0],
          X1: control.memory[1],
        };

        console.log(memo);

        await this.memory.exec(memo, this.regs);

        const logData: LogData = {
          cycle: this.pc + 1,
          before_regs: regsBefore,
          after_regs: this.getRegistersValue(),
          after_memory: this.memory.get_memory_state(),
          b_bus: busBRegisterIndex === BusBRegisters.MBRU ? "MBRU" : BRegister.getLabel(),
          c_bus: busCRegisters.map((reg) => reg.getLabel()),
          ir: {
            ula_control: control.instr,
            bus_c_control: control.busC,
            bus_b_control: control.busB,
            memory_control: control.memory,
          },
        };

        this.logger.log(logData);
      } catch (error: any) {
        this.logger.error({
          message: error.message,
          PC: this.pc + 1,
          IR: this.regs.IR,
        });
      }
    }
  }

  private getRegistersValue() {
    return {
      MAR: this.regs.MAR.read(),
      MDR: this.regs.MDR.read(),
      PC: this.regs.PC.read(),
      MBR: this.regs.MBR.read(),
      SP: this.regs.SP.read(),
      LV: this.regs.LV.read(),
      CPP: this.regs.CPP.read(),
      TOS: this.regs.TOS.read(),
      OPC: this.regs.OPC.read(),
      H: this.regs.H.read(),
    };
  }

  private getBusCRegisters(control: Bit[]): Register[] {
    const indexes = this.selector.exec(control);

    const registers: Register[] = [];

    for (const index of indexes) {
      switch (index) {
        case ResponseULARegisters.MAR:
          registers.push(this.regs.MAR);
          break;
        case ResponseULARegisters.OPC:
          registers.push(this.regs.OPC);
          break;
        case ResponseULARegisters.TOS:
          registers.push(this.regs.TOS);
          break;
        case ResponseULARegisters.CPP:
          registers.push(this.regs.CPP);
          break;
        case ResponseULARegisters.LV:
          registers.push(this.regs.LV);
          break;
        case ResponseULARegisters.SP:
          registers.push(this.regs.SP);
          break;
        case ResponseULARegisters.PC:
          registers.push(this.regs.PC);
          break;
        case ResponseULARegisters.MDR:
          registers.push(this.regs.MDR);
          break;
        case ResponseULARegisters.H:
          registers.push(this.regs.H);
          break;
      }
    }
    return registers;
  }

  private getBusBRegister(index: BusBRegisters): Register {
    switch (index) {
      case BusBRegisters.MDR:
        return this.regs.MDR;
      case BusBRegisters.PC:
        return this.regs.PC;
      case BusBRegisters.MBR:
        return this.regs.MBR;
      case BusBRegisters.MBRU:
        return this.regs.MBR;
      case BusBRegisters.SP:
        return this.regs.SP;
      case BusBRegisters.LV:
        return this.regs.LV;
      case BusBRegisters.CPP:
        return this.regs.CPP;
      case BusBRegisters.TOS:
        return this.regs.TOS;
      case BusBRegisters.OPC:
        return this.regs.OPC;
      default:
        throw new Error("invalid bus B register");
    }
  }

  private parseInstruction(bits: Bit[]): Instruction {
    if (bits.length !== 8) {
      throw new Error("invalid instruction");
    }

    let instr: Instruction = {
      SLL8: bits[0],
      SRA1: bits[1],
      F0: bits[2],
      F1: bits[3],
      ENA: bits[4],
      ENB: bits[5],
      INVA: bits[6],
      INC: bits[7],
    };

    return instr;
  }
}
