import { findOneBy, upsert } from "../../../db/helpers";
import { Win5 } from "../../../entities/Win5";
import { Win5Haraimodoshi } from "../../../entities/Win5Haraimodoshi";
import { Win5Race } from "../../../entities/Win5Race";
import { readInt, readRaw } from "../../Reader";
import { jvdataRaceTool } from "./JvdataRaceTool";
import { JvdataRecord } from "./JvdataRecord";

/** 払戻 1 組ぶんのバイト数 */
const haraimodoshiLength = 29;

/** 数字だけの項目を読みます。空白などの初期値は null */
function readDigits(buffer: Buffer, offset: number, length: number) {
  const str = readRaw(buffer, offset, length);
  return /^\d+$/.test(str) ? Number(str) : null;
}

/** データ区分の順 (詳細発表時 → 1 レース目確定時 → 払戻発表時 → 成績 (月曜)、中止は最後) */
function kubunOrder(kubun: string) {
  return ["1", "2", "3", "7", "9"].indexOf(kubun);
}

/** 0・1 のフラグ */
function readFlag(buffer: Buffer, offset: number) {
  return readInt(buffer, offset, 1) ?? undefined;
}

/**
 * 重勝式 (WF)。詳細発表時・1 レース目確定時・払戻発表時・成績 (月曜) と何度も提供されるので、
 * 取り込む順序によらず、あとの時点の情報を残す (前の時点のデータは読み飛ばす)。
 * データ区分 9 (重勝式中止) はレースの中止ではないので、読み飛ばさずに Win5.Kubun に残す。
 * 対象レースは、レースの行がなければ作る。
 */
export class JvdataWf extends JvdataRecord {
  public readonly id = "WF";
  public readonly length = 7215;

  public async save(buffer: Buffer) {
    const kubun = this.getKubun(buffer);
    const nengappi = readDigits(buffer, 11, 8);
    if (kubun === "0" || !nengappi) {
      return;
    }
    const asIs = findOneBy(Win5, { Nengappi: nengappi });
    if (asIs?.Kubun != null && kubunOrder(String(asIs.Kubun)) > kubunOrder(kubun)) {
      // あとの時点の情報がもう入っている
      return;
    }
    upsert(Win5, {
      Nengappi: nengappi,
      Kubun: Number(kubun),
      HatsubaiHyousuu: readDigits(buffer, 67, 11),
      HenkanFlag: readFlag(buffer, 133),
      FuseiritsuFlag: readFlag(buffer, 134),
      TekichuuNashiFlag: readFlag(buffer, 135),
      CarryOverShoki: readDigits(buffer, 136, 15),
      CarryOverZandaka: readDigits(buffer, 151, 15),
    });

    for (let i = 0; i < 5; i++) {
      // 対象レース (競馬場・回・日目・レース番号) の前に開催年月日を付けて、レース詳細と同じ並びのキーにする
      const key = Buffer.concat([buffer.subarray(0, 19), buffer.subarray(21 + i * 8, 29 + i * 8)]);
      const ensured = await jvdataRaceTool.ensureRace(key);
      if (!ensured) {
        continue;
      }
      upsert(Win5Race, {
        Nengappi: nengappi,
        Jun: i + 1,
        RaceId: ensured.race.Id,
        YuukouHyousuu: readDigits(buffer, 78 + i * 11, 11),
      });
    }

    for (let i = 0; i < 243; i++) {
      const offset = 166 + i * haraimodoshiLength;
      const kumiban = readRaw(buffer, offset, 10);
      if (!/^\d{10}$/.test(kumiban) || /^0+$/.test(kumiban)) {
        continue;
      }
      const umaban = (n: number) => Number(kumiban.substring(n * 2, n * 2 + 2));
      upsert(Win5Haraimodoshi, {
        Nengappi: nengappi,
        Umaban1: umaban(0),
        Umaban2: umaban(1),
        Umaban3: umaban(2),
        Umaban4: umaban(3),
        Umaban5: umaban(4),
        Haraimodoshikin: readDigits(buffer, offset + 10, 9),
        TekichuuHyousuu: readDigits(buffer, offset + 19, 10),
      });
    }
  }
}
