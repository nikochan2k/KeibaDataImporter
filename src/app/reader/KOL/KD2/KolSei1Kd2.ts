import { Service } from "typedi";
import { KolSei1Kd3 } from "../KD3/KolSei1Kd3";
import { kd2Sei1Layout } from "./Kd2Layout";

/** KD2 競走成績レースデータ。KD3 との違いはアドレスだけ */
@Service()
export class KolSei1Kd2 extends KolSei1Kd3 {
  protected layout = kd2Sei1Layout;

  protected getBufferLength() {
    return 2756;
  }
}
