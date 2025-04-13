/*
Um decodificador de 4 bits que habilita um de 9 registradores a comandar o barramento
B da entrada B da ULA.
*/

import { Bit } from "../types/bit";
import { BusBRegisters } from "../types/busBRegisters";

export class Decoder4 {
  exec(binary: Bit[]): BusBRegisters {
    // recebe um número binário de 4 bits
    // retorna o equivalente em base 10
    const decimal = parseInt(binary.join(""), 2);

    // validar valor
    if (decimal < 0 || decimal > 8) {
      throw new Error("invalid decoder value.");
    }

    return decimal;
  }
}
