"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
const fs = __importStar(require("fs"));
class Logger {
    constructor() {
        this.file = fs.createWriteStream("log.txt", { flags: "a" }).on("error", (err) => {
            console.error("Error writing to log file:", err);
        });
    }
    log(data) {
        this.file.write(`=========================\n`);
        this.file.write(`Cycle: ${data.cycle}\n`);
        this.file.write(`IR: ${data.ir.ula_control.join("")} ${data.ir.bus_c_control.join("")} ${data.ir.memory_control.join("")} ${data.ir.bus_b_control.join("")}\n\n`);
        this.file.write(`Bus B: ${data.b_bus}\n`);
        this.file.write(`Bus C: ${data.c_bus.join(", ")}\n\n`);
        this.file.write(`> Registers before instruction:\n`);
        this.logRegisters(data.before_regs);
        this.file.write(`> Registers after instruction:\n`);
        this.logRegisters(data.after_regs);
        this.file.write(`> Memory after instruction:\n`);
        this.logMemory(data.after_memory);
    }
    logMemory(lines) {
        lines.forEach((line) => this.file.write(`${line}\n`));
    }
    logRegisters(regs) {
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
    freeLog(line) {
        this.file.write(`${line}\n`);
    }
    empty({ PC }) {
        this.file.write(`=========================\n`);
        this.file.write(`Cycle: ${PC}\n`);
        this.file.write(`No more lines, EOP.`);
    }
    error({ message, PC, IR }) {
        this.file.write(`=========================\nPC=${PC} IR=${IR.read().join("")} Error, ${message}\n\n`);
    }
}
exports.Logger = Logger;
