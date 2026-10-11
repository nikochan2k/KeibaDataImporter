import { Inject, Injectable } from "@nestjs/common";
import { Bridge } from "../../Bridge";
import { DataToImport } from "../../DataToImport";
import { KolDen1Kd2 } from "../KD2/KolDen1Kd2";
import { KolDen2Kd2 } from "../KD2/KolDen2Kd2";
import { KolBridge } from "../KolBridge";
import { copyFields, isBlank, newRecord, setHeichiShougai, setYoubi } from "./Kd1Convert";
import {
  kd1DenHorseCount,
  kd1DenHorseDataDate,
  kd1DenHorseFrom,
  kd1DenHorseMap,
  kd1DenHorseStep,
  kd1DenRaceMap,
  kd1Length,
  kd2Length,
} from "./Kd1Layout";

/**
 * KD1 の出馬表 (KOL_DEN.DAT)。レースと出走馬 18 頭が 1 レコードに入っている。
 * KD2 の出馬表レースデータと出馬表出走馬データに分けて、KolDen1Kd2, KolDen2Kd2 に渡す。
 */
@Injectable()
export class KolDenKd1 extends DataToImport {
  @Inject()
  private den1: KolDen1Kd2;

  @Inject()
  private den2: KolDen2Kd2;

  @Inject()
  private bridge: Bridge;

  protected getBufferLength() {
    return kd1Length.den;
  }

  protected async setup() {
    // 出馬表出走馬データが予想展開を引く表。KD1 には予想展開がないので空のまま
    (<KolBridge>this.bridge).yosouKyakushitsuMap = new Map<number, number>();
  }

  protected async teardown() {
    delete (<KolBridge>this.bridge).yosouKyakushitsuMap;
  }

  public async save(buffer: Buffer) {
    const race = copyFields(buffer, 0, newRecord(kd2Length.den1), 0, kd1DenRaceMap);
    setYoubi(race);
    setHeichiShougai(race);
    await this.den1.save(race);

    for (let i = 0; i < kd1DenHorseCount; i++) {
      const from = kd1DenHorseFrom + i * kd1DenHorseStep;
      if (isBlank(buffer, from + 11, 2)) {
        // 馬番がない (出走頭数が 18 頭に満たない)
        continue;
      }
      const horse = newRecord(kd2Length.den2);
      buffer.copy(horse, 0, 0, 20);
      setYoubi(horse);
      copyFields(buffer, from, horse, 0, kd1DenHorseMap);
      buffer.copy(horse, kd1DenHorseDataDate, 1527, 1535);
      await this.den2.save(horse);
    }
  }
}
