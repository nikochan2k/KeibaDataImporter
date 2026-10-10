import { Service } from "typedi";
import { KolSei2Kd3 } from "../KD3/KolSei2Kd3";

/** KD2 競走成績出走馬データ。KD3 との違いは予備フィールドの長さだけ */
@Service()
export class KolSei2Kd2 extends KolSei2Kd3 {
  protected getBufferLength() {
    return 474;
  }
}
