import { Service } from "typedi";
import { KolDen2Kd3 } from "../KD3/KolDen2Kd3";
import { kd2Den2Layout } from "./Kd2Layout";

/** KD2 出馬表出走馬データ。KD3 との違いはアドレスだけ */
@Service()
export class KolDen2Kd2 extends KolDen2Kd3 {
  protected layout = kd2Den2Layout;

  protected getBufferLength() {
    return 743;
  }
}
