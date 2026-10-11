import { Injectable } from "@nestjs/common";
import { Ka$ } from "./Ka$";

@Injectable()
export class Kaa extends Ka$ {
  protected getBufferLength() {
    return 56;
  }
}
