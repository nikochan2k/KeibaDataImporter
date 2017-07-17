import { Service } from "typedi";
import { Ba$ } from "./Ba$";

@Service()
export class Bab extends Ba$ {

  protected getBufferLength() {
    return 168;
  }

}