import { DataToImport } from "../../DataToImport";
import { readInt, readPositiveInt } from "../../Reader";
import { jravanRaceTool } from "./JravanRaceTool";
import { jravanSeiUmaLength, jravanShussoubaTool } from "./JravanShussoubaTool";

/** 成績２ (JracSei2.dat): 出馬登録馬が 18 頭を超える場合の馬番 19〜28 の成績・着順 */
export class JravanSei2 extends DataToImport {
  protected getBufferLength() {
    return 1308;
  }

  public async save(buffer: Buffer) {
    const race = await jravanRaceTool.getRace(buffer);
    if (!race) {
      this.logger.warn("成績１が取り込まれていないレースの成績２です");
      return;
    }
    const nen = readPositiveInt(buffer, 0, 4);
    const raceNengappi = readInt(buffer, 0, 8);
    for (let i = 0; i < 10; i++) {
      const uma = jravanShussoubaTool.slice(buffer, 16, i, jravanSeiUmaLength);
      if (!jravanShussoubaTool.hasUma(uma)) {
        continue;
      }
      const saved = await jravanShussoubaTool.saveJravanShussoubaOf(uma, race, nen);
      if (saved) {
        await jravanShussoubaTool.saveSeisekiOf(uma, race, raceNengappi, saved);
      }
    }
  }
}
