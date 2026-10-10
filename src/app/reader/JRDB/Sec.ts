import { Service } from "typedi";
import { Se$ } from "./Se$";


@Service()
export class Sec extends Se$ {

  protected getBufferLength() {
    return 346;
  }

}