"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Register = void 0;
class Register {
    constructor(size, label, initialValue) {
        this.value = new Array(size).fill(0);
        this.label = label;
        if (!initialValue)
            return;
        if (initialValue.length > size) {
            throw new Error("initial value exceeds register size");
        }
        for (let i = 0; i < initialValue.length; i++) {
            this.value[i] = initialValue[i];
        }
    }
    getLabel() {
        return this.label;
    }
    read() {
        return [...this.value];
    }
    write(newValue) {
        if (newValue.length !== this.value.length) {
            throw new Error(`invalid register value size ${this.value.length} != ${newValue.length}, ${this.label}`);
        }
        this.value = [...newValue];
    }
}
exports.Register = Register;
