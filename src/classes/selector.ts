/* 
Um seletor de 9 bits que habilita um ou mais de 9 registradores acima a serem escritos
com o valor na sa´ıda da ULA.
*/

import { Bit } from "../types/bit";
import { ResponseULARegisters } from "../types/responseUlaRegisters";

export class Selector9 {
  exec(binary: Bit[]): ResponseULARegisters[] {
    // pegar as posições em que os bits são 1, ou seja, os registradores habilitados
    // o primeiro bit significa registrador 8, o segundo registrador 7, e assim por diante
    //ex: 100001000
    // result: [8, 3]

    const selectedRegisters: number[] = [];

    for (let i = 0; i < binary.length; i++) {
      if (binary[i] === 1) {
        selectedRegisters.push(binary.length - 1 - i);
      }
    }

    return selectedRegisters as ResponseULARegisters[];
  }
}
