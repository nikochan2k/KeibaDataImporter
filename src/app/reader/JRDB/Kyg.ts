import { Injectable } from "@nestjs/common";
import { Ky$ } from "./Ky$";

@Injectable()
export class Kyg extends Ky$ {
  protected getBufferLength(): number {
    return 545;
  }
}
