import { Service } from "typedi";
import { Sr$ } from "./Sr$";
import { Race } from "../../../entities/Race";

@Service()
export class Sra extends Sr$ {

  protected getBufferLength() {
    return 408;
  }

  protected setRace(buffer: Buffer, toBe: Race) {
  }

}