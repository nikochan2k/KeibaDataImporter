import { findOneBy, upsert } from "../../../db/helpers";
import { Shussouba } from "../../../entities/Shussouba";
import { ShussoubaYosou } from "../../../entities/ShussoubaYosou";
import { readPositiveInt, readRaw } from "../../Reader";
import { jvdataRaceTool } from "./JvdataRaceTool";
import { JvdataRecord } from "./JvdataRecord";
import { jvdataShussoubaTool } from "./JvdataShussoubaTool";

/**
 * データマイニング予想 (DM・TM)。馬番ごとの予想を、出走馬の予想 (ShussoubaYosou) に入れる。
 * 予想は前日・当日・直前・成績 (月曜) の時点ごとに提供されるので、取り込む順序によらず、
 * データ区分の大きい (あとの時点の) 予想を残す。
 * レース・出走馬がまだなければ作る (馬毎レース情報があとから来ても、同じ出走馬になる)。
 */
abstract class JvdataMining extends JvdataRecord {
  /** 予想の繰り返しの数 */
  protected abstract readonly count: number;

  /** 予想 1 頭ぶんのバイト数 */
  protected abstract readonly size: number;

  /** 予想の時点 (データ区分) の列 */
  protected abstract readonly kubunColumn: "DmKubun" | "TmKubun";

  /** 馬番の位置 (offset) から 1 頭ぶんの予想を読みます。予想がなければ null */
  protected abstract readYosou(buffer: Buffer, offset: number): Partial<ShussoubaYosou> | null;

  public async save(buffer: Buffer) {
    const kubun = readPositiveInt(buffer, 2, 1);
    if (!kubun) {
      return;
    }
    const ensured = await jvdataRaceTool.ensureRace(buffer);
    if (!ensured) {
      return;
    }
    for (let i = 0; i < this.count; i++) {
      const offset = 31 + i * this.size;
      if (!readPositiveInt(buffer, offset, 2)) {
        continue;
      }
      const yosou = this.readYosou(buffer, offset);
      const shussouba = jvdataShussoubaTool.createShussouba(buffer, offset, ensured.race.Id);
      if (!yosou || !shussouba) {
        continue;
      }
      const asIs = findOneBy(ShussoubaYosou, { Id: shussouba.Id });
      if (kubun < (asIs?.[this.kubunColumn] ?? 0)) {
        continue;
      }
      upsert(Shussouba, shussouba);
      upsert(ShussoubaYosou, { ...yosou, Id: shussouba.Id, [this.kubunColumn]: kubun }, false);
    }
  }
}

/** 数字だけの項目を読みます。空白などの初期値は null */
function readDigits(buffer: Buffer, offset: number, length: number) {
  const str = readRaw(buffer, offset, length);
  return /^\d+$/.test(str) ? str : null;
}

/** タイム型データマイニング予想 (DM)。予想走破タイムと予想誤差 */
export class JvdataDm extends JvdataMining {
  public readonly id = "DM";
  public readonly length = 303;
  protected readonly count = 18;
  protected readonly size = 15;
  protected readonly kubunColumn = "DmKubun";

  protected readYosou(buffer: Buffer, offset: number) {
    // 予想走破タイムは 9分99秒99、予想誤差は 99秒99
    const time = readDigits(buffer, offset + 2, 5);
    if (!time || /^0+$/.test(time)) {
      return null;
    }
    const gosa = (at: number) => {
      const str = readDigits(buffer, at, 4);
      return str === null ? null : Number(str) / 100;
    };
    return {
      DmTime: Number(time.substring(0, 1)) * 60 + Number(time.substring(1)) / 100,
      DmGosaPlus: gosa(offset + 7),
      DmGosaMinus: gosa(offset + 11),
    };
  }
}

/** 対戦型データマイニング予想 (TM)。予測スコア */
export class JvdataTm extends JvdataMining {
  public readonly id = "TM";
  public readonly length = 141;
  protected readonly count = 18;
  protected readonly size = 6;
  protected readonly kubunColumn = "TmKubun";

  protected readYosou(buffer: Buffer, offset: number) {
    // 000.0〜100.0 (右から 1 バイト目が小数点第一位)
    const score = readDigits(buffer, offset + 2, 4);
    return score === null ? null : { TmScore: Number(score) / 10 };
  }
}
