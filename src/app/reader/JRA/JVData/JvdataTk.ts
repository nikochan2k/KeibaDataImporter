import { readPositiveInt, readRaw } from "../../Reader";
import { jraTool } from "../JraTool";
import { jvdataRaceTool, jvdataYoubiOffset } from "./JvdataRaceTool";
import { JvdataRecord } from "./JvdataRecord";

/** 特別登録馬 1 頭ぶんのバイト数 */
const tourokubaLength = 70;

/**
 * 特別登録馬 (TK)。レース (競走名、グレード、条件、距離、トラック、ハンデ発表日) と、登録馬を保存する。
 * 登録馬は出走馬ではないので、TokubetsuTourokuba に入れる。
 * データ区分 2 (ハンデ発表後) で、ハンデキャップ競走の負担重量が入る。
 * 特別競走番号、競走名の副題・カッコ内・欧字、年齢別の競走条件、コース区分は取り込まない。
 */
export class JvdataTk extends JvdataRecord {
  public readonly id = "TK";
  public readonly length = 21657;

  public async save(buffer: Buffer) {
    if (this.getKubun(buffer) === "0") {
      return;
    }
    const kaisai = await jvdataRaceTool.saveKaisai(buffer, jvdataYoubiOffset);
    if (!kaisai) {
      return;
    }
    const toBe = jvdataRaceTool.createRace(buffer, kaisai.Id);
    if (!toBe) {
      return;
    }
    toBe.JuushouKaisuu = readPositiveInt(buffer, 611, 3);
    jvdataRaceTool.setRaceCodes(toBe, {
      grade: readRaw(buffer, 614, 1),
      shubetsu: readRaw(buffer, 615, 2),
      kigou: readRaw(buffer, 617, 3),
      juuryou: readRaw(buffer, 620, 1),
      // 競走条件は、年齢別に 5 つある。最若年の条件を使う。
      jouken: readRaw(buffer, 633, 3),
      track: readRaw(buffer, 640, 2),
    });
    toBe.Kyori = readPositiveInt(buffer, 636, 4);
    toBe.HandiHappyoubi = readPositiveInt(buffer, 644, 8);
    const race = jvdataRaceTool.upsertRace(toBe);
    await jvdataRaceTool.saveRaceMeiOf(buffer, race);

    for (let i = 0; i < 300; i++) {
      const begin = 655 + i * tourokubaLength;
      await jraTool.saveTokubetsuTourokuba(buffer.subarray(begin, begin + tourokubaLength), race, {
        touroku: 3,
        bamei: 13,
        bameiLength: 36,
        seibetsu: 51,
        choukyoushiCode: 53,
        choukyoushiTanshuku: 58,
        kinryou: 66,
        kouryuuKubun: 69,
      });
    }
  }
}
