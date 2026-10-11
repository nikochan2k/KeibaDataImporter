import { Injectable } from "@nestjs/common";
import { KolSei2 } from "../KolSei2";

/** KD2 競走成績出走馬データ。KD3 との違いは予備フィールドの長さだけ */
@Injectable()
export class KolSei2Kd2 extends KolSei2 {
  protected getBufferLength() {
    return 474;
  }
}
