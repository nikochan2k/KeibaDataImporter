import { Injectable } from "@nestjs/common";
import { Sr$ } from "./Sr$";

@Injectable()
export class Sra extends Sr$ {
  protected getBufferLength() {
    return 408;
  }
}
