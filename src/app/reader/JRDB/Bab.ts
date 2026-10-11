import { Injectable } from "@nestjs/common";
import { Ba$ } from "./Ba$";

@Injectable()
export class Bab extends Ba$ {
  protected getBufferLength() {
    return 168;
  }
}
