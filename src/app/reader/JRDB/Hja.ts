import { Injectable } from "@nestjs/common";
import { Hj$ } from "./Hj$";

@Injectable()
export class Hja extends Hj$ {
  protected getBufferLength() {
    return 240;
  }
}
