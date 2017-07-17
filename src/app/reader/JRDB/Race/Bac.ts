import { Service } from "typedi";
import { Ba$ } from "./Ba$";

@Service()
export class Bac extends Ba$ {

  protected getBufferLength() {
    return 184;
  }

}