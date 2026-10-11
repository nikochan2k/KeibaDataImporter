import { KolDen2 } from "../KolDen2";
import { kd2Den2Layout } from "./Kd2Layout";

/** KD2 出馬表出走馬データ。KD3 との違いはアドレスだけ */
export class KolDen2Kd2 extends KolDen2 {
  protected layout = kd2Den2Layout;

  protected getBufferLength() {
    return 743;
  }
}
