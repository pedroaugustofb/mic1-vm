"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ULA32 = exports.ULA = void 0;
var ULAOperations;
(function (ULAOperations) {
    ULAOperations[ULAOperations["AND"] = 0] = "AND";
    ULAOperations[ULAOperations["OR"] = 1] = "OR";
    ULAOperations[ULAOperations["XOR"] = 2] = "XOR";
    ULAOperations[ULAOperations["ADD"] = 3] = "ADD";
})(ULAOperations || (ULAOperations = {}));
class ULA {
    exec(instr, A, B, carryIn) {
        // aplica o controle ENA (enable A): se A for habilitado, usa A, senão usa 0
        let a = instr.ENA ? A : 0;
        // aplica o controle INVA (inverter A): se A for habilitado, inverte A
        a = instr.INVA ? (a ^ 1) : a;
        // aplica o controle ENB (enable B): se B for habilitado, usa B, senão usa 0
        let b = instr.ENB ? B : 0;
        let S = 0;
        let carryOut = 0;
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
    getOperation(instr) {
        if (instr.F0 === 0 && instr.F1 === 0)
            return ULAOperations.AND;
        else if (instr.F0 === 0 && instr.F1 === 1)
            return ULAOperations.OR;
        else if (instr.F0 === 1 && instr.F1 === 0)
            return ULAOperations.XOR;
        else
            return ULAOperations.ADD;
    }
    and(a, b) {
        return (a & b);
    }
    or(a, b) {
        return (a | b);
    }
    xor(a, b) {
        return (a ^ b);
    }
    add(a, b, inc, carryIn) {
        // Se INC está ativo, B é forçado a 1, ignorando o valor real de B
        const realB = inc ? 1 : b;
        // Soma: A + realB + carryIn
        const sum = a ^ realB ^ carryIn; // XOR para resultado do bit
        const carryOut = (a & realB) | (a & carryIn) | (realB & carryIn); // lógica de carry do full adder
        return { S: sum, carryOut: carryOut }; // retorna o resultado e o carry out
    }
}
exports.ULA = ULA;
class ULA32 {
    constructor() {
        this.ula1bit = new ULA();
    }
    exec(instr, A, B) {
        if (A.length !== 32 || B.length !== 32) {
            throw new Error("invalid size of A or B");
        }
        if (instr.SLL8 && instr.SRA1) {
            throw new Error("invalid control signals.");
        }
        let S = Array(32).fill(0);
        let carry = 0;
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
    leftShift(S) {
        // Retorna os 24 bits mais significativos e adiciona 8 bits 0 no final
        return [...S.slice(8, 32), ...Array(8).fill(0)];
    }
    rightShift(S) {
        // deslocamento aritmético para a direita de 1 bit
        return [S[0], ...S.slice(0, 31)];
    }
}
exports.ULA32 = ULA32;
