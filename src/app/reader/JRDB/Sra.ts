import { Service } from "typedi";
import { Sr$ } from "./Sr$";

@Service()
export class Sra extends Sr$ {

  protected getBufferLength() {
    return 408;
  }

}