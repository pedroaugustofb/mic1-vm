import * as fs from "fs";
import Mic1VM from "./classes/vm";


const files = ["./test/programa_etapa1.txt", "./test/programa_etapa2-1.txt", "./test/programa_etapa2-2.txt", "./test/programa_etapa3-1.txt"];

function main() {
  // deve vir como flag na linha de comando
  const etapa = process.argv[2];

  if (!etapa) {
    console.error("Etapa não informada");
    return;
  }

  const file_path = files[Number(etapa) - 1];

  if (!file_path) {
    console.error("Arquivo de entrada inválido");
    return;
  }

  console.log(`-> Iniciando Virtual Machine...`);
  console.log(`-> Carregando programa 'etapa ${etapa}'...`);

  // limpando o arquivo de log
  fs.writeFileSync("log.txt", "");
  console.log(`-> Limpando arquivo de log...`);
  console.log(`-> Executando programa...`);

  const program = fs
    .readFileSync(file_path, "utf-8")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  const VM = new Mic1VM();

  VM.run(program);
}

main();
