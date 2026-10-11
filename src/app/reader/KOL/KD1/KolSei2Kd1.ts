import { EntityManager } from "typeorm";
import * as $C from "../../../converters/Common";
import { Kaisai } from "../../../entities/Kaisai";
import { OrmManager } from "../../../OrmManager";
import { DataToImport } from "../../DataToImport";
import { readInt, readRaw } from "../../Reader";
import { KolSei2Kd2 } from "../KD2/KolSei2Kd2";
import { isBlank } from "./Kd1Convert";
import { kd1Length, kd1Sei2HorseCount, kd1Sei2HorseFrom, kd1SeiHorseStep } from "./Kd1Layout";
import { toSei2Record } from "./KolSeiKd1";

/**
 * KD1 の競走成績２ (KOL_SEI2.DAT)。19〜28 番の出走馬 10 頭が 1 レコードに入っている。
 * 出走馬の並びは競走成績と同じ。レースコードはレコードの先頭の 12 バイトにあるが、年月日はない。
 * 年月日は、先に取り込んだ競走成績(または出馬表)の開催から、場所・年・回・日で探す。
 */
export class KolSei2Kd1 extends DataToImport {
  @OrmManager()
  protected entityManager: EntityManager;

  private sei2 = new KolSei2Kd2();

  protected getBufferLength() {
    return kd1Length.sei2;
  }

  public async save(buffer: Buffer) {
    const raceDate = await this.findRaceDate(buffer);
    if (!raceDate) {
      this.logger.warn(
        `競走成績２の開催が見つかりません (先に競走成績を取り込んでください): ${readRaw(buffer, 0, 12)}`,
      );
      return;
    }
    const dataDate = buffer.subarray(1332, 1340);
    for (let i = 0; i < kd1Sei2HorseCount; i++) {
      const from = kd1Sei2HorseFrom + i * kd1SeiHorseStep;
      if (isBlank(buffer, from + 51, 2)) {
        continue;
      }
      await this.sei2.save(toSei2Record(buffer, from, dataDate, raceDate));
    }
  }

  /** レースコード(場所・開催年・回次・日次)から、取り込み済みの開催の年月日を探す */
  private async findRaceDate(buffer: Buffer) {
    const kaisai = await this.entityManager.findOneBy(Kaisai, {
      Basho: $C.basho.toCodeFromKol(buffer, 0, 2),
      Nen: readInt(buffer, 2, 4),
      Kaiji: readInt(buffer, 6, 2),
      Nichiji: readInt(buffer, 8, 2),
    });
    if (!kaisai) {
      return null;
    }
    const pad = (n: number, width: number) => String(n).padStart(width, "0");
    return Buffer.from(`${pad(kaisai.Nen, 4)}${pad(kaisai.Gatsu, 2)}${pad(kaisai.Nichi, 2)}`);
  }
}
