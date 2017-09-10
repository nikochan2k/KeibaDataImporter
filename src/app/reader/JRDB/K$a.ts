import { Service } from "typedi";
import { K$$ } from "./K$$";

@Service()
export class K$a extends K$$ {

  protected getBufferLength() {
    return 272;
  }

}