"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const busBRegisters_1 = require("../types/busBRegisters");
const responseUlaRegisters_1 = require("../types/responseUlaRegisters");
const decoder_1 = require("./decoder");
const logger_1 = require("./logger");
const memory_1 = require("./memory");
const register_1 = require("./register");
const selector_1 = require("./selector");
const ula_1 = require("./ula");
class Mic1VM {
    constructor() {
        this.pc = -1; // Program Counter
        this.ula = new ula_1.ULA32();
        this.decoder = new decoder_1.Decoder4();
        this.selector = new selector_1.Selector9();
        this.memory = new memory_1.Memory();
        this.regs = {
            IR: new register_1.Register(23, "IR"), // Instruction Register
            H: new register_1.Register(32, "H"), // Hold Register
            OPC: new register_1.Register(32, "OPC"), // Old Program Counter Register
            TOS: new register_1.Register(32, "TOS"), // Top of Stack Register
            CPP: new register_1.Register(32, "CPP"), // Constant Pool Pointer Register
            LV: new register_1.Register(32, "LV"), // Local Variable Register
            SP: new register_1.Register(32, "SP", "00000000000000000000000000000100".split("").map((bit) => parseInt(bit))), // Stack Pointer Register
            PC: new register_1.Register(32, "PC"), // Program Counter Register
            MDR: new register_1.Register(32, "MDR"), // Memory Data Register
            MAR: new register_1.Register(32, "MAR", "00000000000000000000000000000100".split("").map((bit) => parseInt(bit))), // Memory Address Register
            MBR: new register_1.Register(8, "MBR"), // Memory Buffer Register
        };
        this.logger = new logger_1.Logger();
    }
    async run(program) {
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
                if (busBRegisterIndex === busBRegisters_1.BusBRegisters.MBR) {
                    let signalBit = B[0];
                    B = [...B, ...Array(24).fill(signalBit)];
                }
                if (busBRegisterIndex === busBRegisters_1.BusBRegisters.MBRU) {
                    B = [...B, ...Array(24).fill(0)];
                }
                // salva a instrução no registrador de instrução
                this.regs.IR.write(instruction);
                const instr = this.parseInstruction(control.instr);
                const { S, CO, N, SD, Z } = this.ula.exec(instr, A, B);
                // pegar os registradores habilitados
                const busCRegisters = this.getBusCRegisters(control.busC);
                console.log(busCRegisters);
                // escreve os registradores habilitados
                for (const register of busCRegisters) {
                    register.write(SD);
                }
                const memo = {
                    X0: control.memory[0],
                    X1: control.memory[1],
                };
                console.log(memo);
                await this.memory.exec(memo, this.regs);
                const logData = {
                    cycle: this.pc + 1,
                    before_regs: regsBefore,
                    after_regs: this.getRegistersValue(),
                    after_memory: this.memory.get_memory_state(),
                    b_bus: busBRegisterIndex === busBRegisters_1.BusBRegisters.MBRU ? "MBRU" : BRegister.getLabel(),
                    c_bus: busCRegisters.map((reg) => reg.getLabel()),
                    ir: {
                        ula_control: control.instr,
                        bus_c_control: control.busC,
                        bus_b_control: control.busB,
                        memory_control: control.memory,
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
    getBusCRegisters(control) {
        const indexes = this.selector.exec(control);
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
