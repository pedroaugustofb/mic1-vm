import { Bit } from "./bit";

export interface Instruction {
  SLL8: Bit;
  SRA1: Bit;
  F0: Bit;
  F1: Bit;
  ENA: Bit;
  ENB: Bit;
  INVA: Bit;
  INC: Bit;
}
