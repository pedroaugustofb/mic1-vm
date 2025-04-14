import * as fs from "fs";
import { Bit } from "../types/bit";
import { Memo } from "../types/memory";
import { Registers } from "../types/registers";

enum MemoryAction {
  READ = "READ",
  WRITE = "WRITE",
}

export class Memory {
  setup(lines: string[]) {
    const instructions = lines.join("\n");
    fs.writeFileSync("instructions.txt", instructions, "utf-8");

    fs.writeFileSync(
      "data.txt",

      `00000000000000000000000000000000
00000000000000000000000000000000
00000000000000000000000000000000
00000000000000000000000000000000
00000000000000000000000000000010
00000000000000000000000000000000
00000000000000000000000000000000
00000000000000000000000000000000
00000000000000000000000000000000
00000000000000000000000000000000
00000000000000000000000000000000
00000000000000000000000000000000
00000000000000000000000000000000
00000000000000000000000000000000
00000000000000000000000000000000
00000000000000000000000000000000`,

      "utf-8"
    );

    console.log("-> Memory initialized");
  }

  read_instruction(line: number): Bit[] {
    const data = fs.readFileSync("instructions.txt", "utf-8");
    const lines = data.split("\n");
    const instruction = lines[line];

    if (!instruction) {
      throw new Error("invalid instruction line.");
    }

    return instruction.split("").map((bit: string) => parseInt(bit) as Bit);
  }

  exec(control: Memo, registers: Registers) {
    if ((control.X0 && control.X1) || (!control.X0 && !control.X1)) {
      throw new Error("Invalid memory control signals");
    }

    const action = control.X0 ? MemoryAction.READ : MemoryAction.WRITE;

    switch (action) {
      case MemoryAction.WRITE:
        this.write(registers);
        break;
      case MemoryAction.READ:
        this.read(registers);
        break;
      default:
        throw new Error("invalid memory action.");
    }
  }

  private write(registers: Registers) {
    const address = registers.MAR.read();

    // calculate the line of data.txt
    const line = parseInt(address.join(""), 2);

    if (line < 0 || line > 8) {
      throw new Error("invalid memory address.");
    }

    // write the data to the file
    const data = registers.MDR.read();

    if (data.length > 32) {
      throw new Error("invalid memory data size.");
    }

    // change the value of the line
    this.write_data_line(line, data);
  }

  private read(registers: Registers) {
    const address = registers.MAR.read();

    // get the line of data.txt
    const line = parseInt(address.join(""), 2);

    if (line < 0 || line > 8) {
      throw new Error("invalid memory address.");
    }

    // read the data from the file
    const data = fs.readFileSync("data.txt", "utf-8");

    // go to the line
    const lineData = data.split("\n")[line];

    if (!lineData) {
      throw new Error("invalid memory data.");
    }

    // get the data from the line
    const dataBits = lineData.split("").map((bit: string) => parseInt(bit) as Bit);

    if (dataBits.length > 32) {
      throw new Error("invalid memory data size.");
    }

    // write the data to the register
    registers.MDR.write(dataBits);
  }

  private write_data_line(line: number, data: Bit[]) {
    const file = fs.readFileSync("data.txt", "utf-8");
    const lines = file.split("\n");
    lines[line] = data.join("");
    const newData = lines.join("\n");
    fs.writeFileSync("data.txt", newData, "utf-8");
  }

  get_memory_state() {
    const file = fs.readFileSync("data.txt", "utf-8");
    const lines = file.split("\n");
    return lines;
  }
}
