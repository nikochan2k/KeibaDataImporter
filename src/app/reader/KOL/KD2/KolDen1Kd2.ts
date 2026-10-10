import { Service } from "typedi";
import { KolDen1 } from "../KolDen1";
import { kd2Den1Layout } from "./Kd2Layout";

/** KD2 出馬表レースデータ。KD3 との違いはアドレスだけ */
@Service()
export class KolDen1Kd2 extends KolDen1 {
  protected layout = kd2Den1Layout;

  protected getBufferLength() {
    return 779;
  }
}
