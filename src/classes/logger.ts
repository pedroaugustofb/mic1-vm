import * as fs from "fs";
import { Bit } from "../types/bit";
import { Register } from "./register";

type LogRegs = {
  MAR: Bit[];
  MDR: Bit[];
  PC: Bit[];
  MBR: Bit[];
  SP: Bit[];
  LV: Bit[];
  CPP: Bit[];
  TOS: Bit[];
  OPC: Bit[];
  H: Bit[];
};

export type LogData = {
  cycle: number;
  before_regs: LogRegs;
  after_regs: LogRegs;
  after_memory: string[];
  b_bus: string;
  c_bus: string[];
  ir: {
    ula_control: Bit[];
    bus_c_control: Bit[];
    bus_b_control: Bit[];
    memory_control: Bit[];
  };
};

export class Logger {
  private file = fs.createWriteStream("log.txt", { flags: "a" }).on("error", (err) => {
    console.error("Error writing to log file:", err);
  });

  log(data: LogData) {
    this.file.write(`=========================\n`);
    this.file.write(`Cycle: ${data.cycle}\n`);
    this.file.write(
      `IR: ${data.ir.ula_control.join("")} ${data.ir.bus_c_control.join("")} ${data.ir.memory_control.join("")} ${data.ir.bus_b_control.join("")}\n\n`
    );

    this.file.write(`Bus B: ${data.b_bus}\n`);
    this.file.write(`Bus C: ${data.c_bus.join(", ")}\n\n`);

    this.file.write(`> Registers before instruction:\n`);
    this.logRegisters(data.before_regs);

    this.file.write(`> Registers after instruction:\n`);
    this.logRegisters(data.after_regs);

    this.file.write(`> Memory after instruction:\n`);
    this.logMemory(data.after_memory);
  }

  logMemory(lines: string[]) {
    lines.forEach((line) => this.file.write(`${line}\n`));
  }

  logRegisters(regs: LogRegs) {
    this.file.write(`MAR: ${regs.MAR.join("")}\n`);
    this.file.write(`MDR: ${regs.MDR.join("")}\n`);
    this.file.write(`PC: ${regs.PC.join("")}\n`);
    this.file.write(`MBR: ${regs.MBR.join("")}\n`);
    this.file.write(`SP: ${regs.SP.join("")}\n`);
    this.file.write(`LV: ${regs.LV.join("")}\n`);
    this.file.write(`CPP: ${regs.CPP.join("")}\n`);
    this.file.write(`TOS: ${regs.TOS.join("")}\n`);
    this.file.write(`OPC: ${regs.OPC.join("")}\n`);
    this.file.write(`H: ${regs.H.join("")}\n\n`);
  }

  freeLog(line: string) {
    this.file.write(`${line}\n`);
  }

  empty({ PC }: { PC: number }) {
    this.file.write(`=========================\n`);
    this.file.write(`Cycle: ${PC}\n`);
    this.file.write(`No more lines, EOP.`);
  }

  error({ message, PC, IR }: { message: string; PC: number; IR: Register }) {
    this.file.write(`=========================\nPC=${PC} IR=${IR.read().join("")} Error, ${message}\n\n`);
  }
}
