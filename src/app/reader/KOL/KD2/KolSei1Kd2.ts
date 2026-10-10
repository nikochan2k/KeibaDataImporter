import { Service } from "typedi";
import { KolSei1 } from "../KolSei1";
import { kd2Sei1Layout } from "./Kd2Layout";

/** KD2 競走成績レースデータ。KD3 との違いはアドレスだけ */
@Service()
export class KolSei1Kd2 extends KolSei1 {
  protected layout = kd2Sei1Layout;

  protected getBufferLength() {
    return 2756;
  }
}
