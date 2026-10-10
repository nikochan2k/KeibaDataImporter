import { Service } from "typedi";
import { Hj$ } from "./Hj$";

@Service()
export class Hja extends Hj$ {

  protected getBufferLength() {
    return 240;
  }

}