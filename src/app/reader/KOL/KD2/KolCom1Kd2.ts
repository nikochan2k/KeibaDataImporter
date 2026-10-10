import { Service } from "typedi";
import { KolCom1 } from "../KolCom1";

/** KD2 騎手厩舎コメント／次走へのメモ。KD3 との違いは「前回出走時のコメント」がないことだけ */
@Service()
export class KolCom1Kd2 extends KolCom1 {
  protected getBufferLength() {
    return 2050;
  }
}
