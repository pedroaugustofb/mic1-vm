"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Register = void 0;
class Register {
    constructor(size, initialValue) {
        this.value = new Array(size).fill(0);
        if (initialValue) {
            for (let i = 0; i < Math.min(size, initialValue.length); i++) {
                this.value[i] = initialValue[i];
            }
        }
    }
    read() {
        return [...this.value];
    }
    write(newValue) {
        if (newValue.length !== this.value.length) {
            throw new Error("invalid register value size");
        }
        this.value = [...newValue];
    }
}
exports.Register = Register;
