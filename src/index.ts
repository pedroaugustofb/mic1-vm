import * as fs from "fs";
import Mic1VM from "./classes/vm";

enum Etapa {
  ETAPA1 = 1,
  ETAPA2 = 2,
  ETAPA3 = 3,
}

const files = ["./test/programa_etapa1.txt", "./test/programa_etapa2.txt"];

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

  let output: string[] = [];

  const VM = new Mic1VM();

  VM.run(program);
}

main();
