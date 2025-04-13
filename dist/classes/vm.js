"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const busBRegisters_1 = require("../types/busBRegisters");
const responseUlaRegisters_1 = require("../types/responseUlaRegisters");
const decoder_1 = require("./decoder");
const logger_1 = require("./logger");
const register_1 = require("./register");
const selector_1 = require("./selector");
const ula_1 = require("./ula");
class Mic1VM {
    constructor() {
        this.pc = -1; // Program Counter
        this.ula = new ula_1.ULA32();
        this.decoder = new decoder_1.Decoder4();
        this.selector = new selector_1.Selector9();
        this.regs = {
            IR: new register_1.Register(21, "IR"), // Instruction Register
            H: new register_1.Register(32, "H", Array(31).fill(0).concat([1]) // Hold Register
            ),
            OPC: new register_1.Register(32, "OPC"), // Old Program Counter Register
            TOS: new register_1.Register(32, "TOS", Array(30).fill(0).concat([1, 0]) // Top of Stack Register
            ),
            CPP: new register_1.Register(32, "CPP"), // Constant Pool Pointer Register
            LV: new register_1.Register(32, "LV"), // Local Variable Register
            SP: new register_1.Register(32, "SP"), // Stack Pointer Register
            PC: new register_1.Register(32, "PC"), // Program Counter Register
            MDR: new register_1.Register(32, "MDR"), // Memory Data Register
            MAR: new register_1.Register(32, "MAR"), // Memory Address Register
            MBR: new register_1.Register(8, "MBR", [1, ...Array(6).fill(0), 1] // Memory Buffer Register
            ), // Memory Buffer Register
        };
        this.logger = new logger_1.Logger();
    }
    run(program) {
        this.logger.freeLog("=====================================================");
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
                    break;
                }
                const control = {
                    busB: program[this.pc].slice(17, 21).split("").map(Number),
                    busC: program[this.pc].slice(8, 17).split("").map(Number),
                    instr: program[this.pc].slice(0, 8).split("").map(Number),
                };
                // decodifica qual registrador tem acesso ao barramento b
                const busBRegisterIndex = this.decoder.exec(control.busB);
                const BRegister = this.getBusBRegister(busBRegisterIndex);
                let B = BRegister.read();
                if (busBRegisterIndex === busBRegisters_1.BusBRegisters.MBR) {
                    let signalBit = B[0];
                    B = [...B, ...Array(24).fill(signalBit)];
                }
                if (busBRegisterIndex === busBRegisters_1.BusBRegisters.MBRU) {
                    B = [...B, ...Array(24).fill(0)];
                }
                // salva a instrução no registrador de instrução
                this.regs.IR.write(program[this.pc].split("").map(Number));
                const instr = this.parseInstruction(control.instr);
                const { S, CO, N, SD, Z } = this.ula.exec(instr, A, B);
                // pegar os registradores habilitados
                const busCRegisters = this.getBusCRegisters(program);
                // escreve os registradores habilitados
                for (const register of busCRegisters) {
                    register.write(SD);
                }
                const logData = {
                    cycle: this.pc + 1,
                    before_regs: regsBefore,
                    after_regs: this.getRegistersValue(),
                    b_bus: busBRegisterIndex === busBRegisters_1.BusBRegisters.MBRU ? "MBRU" : BRegister.getLabel(),
                    c_bus: busCRegisters.map((reg) => reg.getLabel()),
                    ir: {
                        ula_control: control.instr,
                        bus_c_control: control.busC,
                        bus_b_control: control.busB,
                    },
                };
                this.logger.log(logData);
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
    getRegistersValue() {
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
    getBusCRegisters(program) {
        const busCControl = program[this.pc].slice(8, 17).split("").map(Number);
        const indexes = this.selector.exec(busCControl);
        const registers = [];
        for (const index of indexes) {
            switch (index) {
                case responseUlaRegisters_1.ResponseULARegisters.MAR:
                    registers.push(this.regs.MAR);
                    break;
                case responseUlaRegisters_1.ResponseULARegisters.OPC:
                    registers.push(this.regs.OPC);
                    break;
                case responseUlaRegisters_1.ResponseULARegisters.TOS:
                    registers.push(this.regs.TOS);
                    break;
                case responseUlaRegisters_1.ResponseULARegisters.CPP:
                    registers.push(this.regs.CPP);
                    break;
                case responseUlaRegisters_1.ResponseULARegisters.LV:
                    registers.push(this.regs.LV);
                    break;
                case responseUlaRegisters_1.ResponseULARegisters.SP:
                    registers.push(this.regs.SP);
                    break;
                case responseUlaRegisters_1.ResponseULARegisters.PC:
                    registers.push(this.regs.PC);
                    break;
                case responseUlaRegisters_1.ResponseULARegisters.MDR:
                    registers.push(this.regs.MDR);
                    break;
                case responseUlaRegisters_1.ResponseULARegisters.H:
                    registers.push(this.regs.H);
                    break;
            }
        }
        return registers;
    }
    getBusBRegister(index) {
        switch (index) {
            case busBRegisters_1.BusBRegisters.MDR:
                return this.regs.MDR;
            case busBRegisters_1.BusBRegisters.PC:
                return this.regs.PC;
            case busBRegisters_1.BusBRegisters.MBR:
                return this.regs.MBR;
            case busBRegisters_1.BusBRegisters.MBRU:
                return this.regs.MBR;
            case busBRegisters_1.BusBRegisters.SP:
                return this.regs.SP;
            case busBRegisters_1.BusBRegisters.LV:
                return this.regs.LV;
            case busBRegisters_1.BusBRegisters.CPP:
                return this.regs.CPP;
            case busBRegisters_1.BusBRegisters.TOS:
                return this.regs.TOS;
            case busBRegisters_1.BusBRegisters.OPC:
                return this.regs.OPC;
            default:
                throw new Error("invalid bus B register");
        }
    }
    parseInstruction(bits) {
        if (bits.length !== 8) {
            throw new Error("invalid instruction");
        }
        let instr = {
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
exports.default = Mic1VM;
