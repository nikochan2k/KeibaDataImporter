import { DataToImport } from "../../DataToImport";
import { KolSei1Kd2 } from "../KD2/KolSei1Kd2";
import { KolSei2Kd2 } from "../KD2/KolSei2Kd2";
import { copyFields, isBlank, newRecord, setYoubi } from "./Kd1Convert";
import {
  kd1Length,
  kd1SeiHorseCount,
  kd1SeiHorseFrom,
  kd1SeiHorseMap,
  kd1SeiHorseStep,
  kd1SeiRaceMap,
  kd2Length,
} from "./Kd1Layout";

/**
 * KD1 の競走成績 (KOL_SEI.DAT)。レースと出走馬 18 頭が 1 レコードに入っている。
 * KD2 の競走成績レースデータと競走成績出走馬データに分けて、KolSei1Kd2, KolSei2Kd2 に渡す。
 */
export class KolSeiKd1 extends DataToImport {
  private sei1 = new KolSei1Kd2();

  private sei2 = new KolSei2Kd2();

  protected getBufferLength() {
    return kd1Length.sei;
  }

  public async save(buffer: Buffer) {
    const race = copyFields(buffer, 0, newRecord(kd2Length.sei1), 0, kd1SeiRaceMap);
    setYoubi(race);
    await this.sei1.save(race);

    const dataDate = buffer.subarray(3168, 3176);
    for (let i = 0; i < kd1SeiHorseCount; i++) {
      const from = kd1SeiHorseFrom + i * kd1SeiHorseStep;
      if (isBlank(buffer, from + 51, 2)) {
        // 馬番がない (出走頭数が 18 頭に満たない)
        continue;
      }
      await this.sei2.save(toSei2Record(buffer, from, dataDate, buffer.subarray(12, 20)));
    }
  }
}

/**
 * 出走馬 1 頭分を、KD2 の競走成績出走馬データにする。
 * レースコードはレコードの先頭から、年月日は raceDate から写す
 */
export function toSei2Record(
  buffer: Buffer,
  horseFrom: number,
  dataDate: Buffer,
  raceDate: Buffer,
) {
  const record = newRecord(kd2Length.sei2);
  buffer.copy(record, 0, 0, 12);
  raceDate.copy(record, 12);
  setYoubi(record);
  copyFields(buffer, horseFrom, record, 0, kd1SeiHorseMap);
  dataDate.copy(record, 424);
  return record;
}
