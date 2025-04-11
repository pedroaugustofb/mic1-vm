import * as fs from "fs";
import { Bit } from "../types/bit";
import { Register } from "./register";

export class Logger {
  private file = fs.createWriteStream("log.txt", { flags: "a" });

  log({ PC, IR, A, B, S, SD, CO, N, Z }: { PC: number; IR: Register; A: Bit[]; B: Bit[]; S: Bit[]; SD: Bit[]; CO: Bit; N: Bit; Z: Bit }) {
    this.file.write(
      `=========================\nPC=${PC}\nIR=${IR.read().join("")}\nA=${A.join("")}\nB=${B.join("")}\nS=${S.join("")}\nSD=${SD.join(
        ""
      )}\nCO=${CO}\nN=${N}\nZ=${Z}\n\n`
    );
  }

  empty({ PC }: { PC: number }) {
    this.file.write(`=========================\nPC=${PC} empty cycle.\n\n`);
  }

  error({ message, PC, IR }: { message: string; PC: number; IR: Register }) {
    this.file.write(`=========================\nPC=${PC} IR=${IR.read().join("")} Error, ${message}\n\n`);
  }
}
