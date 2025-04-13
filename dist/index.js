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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const vm_1 = __importDefault(require("./classes/vm"));
var Etapa;
(function (Etapa) {
    Etapa[Etapa["ETAPA1"] = 1] = "ETAPA1";
    Etapa[Etapa["ETAPA2"] = 2] = "ETAPA2";
    Etapa[Etapa["ETAPA3"] = 3] = "ETAPA3";
})(Etapa || (Etapa = {}));
const files = ["./test/programa_etapa1.txt", "./test/programa_etapa2-1.txt", "./test/programa_etapa2-2.txt"];
function main() {
    // deve vir como flag na linha de comando
    const etapa = process.argv[2];
    if (!etapa) {
        console.error("Etapa não informada");
        return;
    }
    if (!Object.values(Etapa).includes(Number(etapa))) {
        console.error("Etapa inválida");
        return;
    }
    console.log(`-> Iniciando Virtual Machine...`);
    console.log(`-> Carregando programa 'etapa ${etapa}'...`);
    // limpando o arquivo de log
    fs.writeFileSync("log.txt", "");
    console.log(`-> Limpando arquivo de log...`);
    console.log(`-> Executando programa...`);
    const file_path = files[Number(etapa) - 1];
    const program = fs
        .readFileSync(file_path, "utf-8")
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0);
    const VM = new vm_1.default();
    VM.run(program);
}
main();
