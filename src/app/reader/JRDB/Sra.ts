import { Service } from "typedi";
import { Sr$ } from "./Sr$";
import { Kaisai } from "../../entities/Kaisai";
import { Race } from "../../entities/Race";

@Service()
export class Sra extends Sr$ {

  protected getBufferLength() {
    return 408;
  }

  protected setKaisai(buffer: Buffer, toBe: Kaisai) {
  }

  protected setRace(buffer: Buffer, toBe: Race) {
  }

}