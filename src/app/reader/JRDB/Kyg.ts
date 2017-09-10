import { Service } from "typedi";
import { Ky$ } from "./Ky$";

@Service()
export class Kyg extends Ky$ {

  protected getBufferLength(): number {
    return 545;
  }

}