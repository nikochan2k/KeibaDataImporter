import { DataToImport } from "../../DataToImport";
import { readPositiveInt } from "../../Reader";
import { jraTool } from "../JraTool";
import { jravanRaceTool } from "./JravanRaceTool";

/** 特別登録馬 1 頭ぶんのバイト数 */
const tourokubaLength = 48;

/**
 * 特別登録馬 (JracTok1.dat): 特別レースの登録馬一覧。
 * レース (競走名、グレード、条件、距離、トラック、コースレコード、ハンデ発表日) と、登録馬を保存する。
 * 登録馬は出走馬ではないので、TokubetsuTourokuba に入れる。
 */
export class JravanTok1 extends DataToImport {
  protected getBufferLength() {
    return 5129;
  }

  public async save(buffer: Buffer) {
    const kaisai = await jravanRaceTool.saveKaisai(buffer);
    if (!kaisai) {
      return;
    }
    const toBe = await jravanRaceTool.createRaceWith(buffer, kaisai.Id);
    if (!toBe) {
      return;
    }
    toBe.HandiHappyoubi = readPositiveInt(buffer, 316, 8);
    const race = jravanRaceTool.upsertRace(toBe);
    await jravanRaceTool.saveRaceMeiOf(buffer, 17, 40, race);

    for (let i = 0; i < 100; i++) {
      const begin = 327 + i * tourokubaLength;
      await jraTool.saveTokubetsuTourokuba(buffer.subarray(begin, begin + tourokubaLength), race, {
        touroku: 3,
        bamei: 13,
        bameiLength: 18,
        seibetsu: 31,
        choukyoushiCode: 35,
        choukyoushiTanshuku: 40,
        kinryou: 32,
      });
    }
  }
}
