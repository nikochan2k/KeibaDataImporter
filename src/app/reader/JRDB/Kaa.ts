import { Service } from "typedi";
import { Ka$ } from "./Ka$";

@Service()
export class Kaa extends Ka$ {

  protected getBufferLength() {
    return 56;
  }

}