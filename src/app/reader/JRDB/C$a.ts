import { Service } from "typedi";
import { C$$ } from "./C$$";

@Service()
export class C$a extends C$$ {

  protected getBufferLength() {
    return 272;
  }

}