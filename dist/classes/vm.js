"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("./logger");
const register_1 = require("./register");
const ula_1 = require("./ula");
class Mic1VM {
    constructor() {
        this.pc = -1; // Program Counter
        this.ula = new ula_1.ULA32();
        this.regs = {
            IR: new register_1.Register(8), // Instruction Register
        };
        this.logger = new logger_1.Logger();
    }
    run(program) {
        // 32 bits
        const A = new Array(31).fill(0).concat(1);
        const B = [1, ...new Array(31).fill(0)];
        const carryIn = 0;
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
                this.regs.IR.write(program[this.pc].split("").map(Number));
                const instr = this.parseInstruction(program[this.pc]);
                const { S, CO, N, SD, Z } = this.ula.exec(instr, A, B, carryIn);
                this.logger.log({ PC: this.pc + 1, IR: this.regs.IR, A, B, S, CO, N, SD, Z });
            }
            catch (error) {
                this.logger.error({
                    message: error.message,
                    PC: this.pc + 1,
                    IR: this.regs.IR,
                });
            }
        }
    }
    parseInstruction(line) {
        if (line.length !== 8 || /[^01]/.test(line)) {
            throw new Error(`invalid instrucion at line ${line}`);
        }
        const bits = line.split("").map(Number);
        let instr = {
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
exports.default = Mic1VM;
