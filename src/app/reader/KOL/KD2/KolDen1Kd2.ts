import { Service } from "typedi";
import { KolDen1Kd3 } from "../KD3/KolDen1Kd3";
import { kd2Den1Layout } from "./Kd2Layout";

/** KD2 出馬表レースデータ。KD3 との違いはアドレスだけ */
@Service()
export class KolDen1Kd2 extends KolDen1Kd3 {
  protected layout = kd2Den1Layout;

  protected getBufferLength() {
    return 779;
  }
}
