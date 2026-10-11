import { Inject, Service } from "typedi";
import { DataToImport } from "../../DataToImport";
import { readInt, readPositiveInt } from "../../Reader";
import { JravanRaceTool } from "./JravanRaceTool";
import { JravanShussoubaTool, jravanSeiUmaLength } from "./JravanShussoubaTool";

/** 成績２ (JracSei2.dat): 出馬登録馬が 18 頭を超える場合の馬番 19〜28 の成績・着順 */
@Service()
export class JravanSei2 extends DataToImport {
  @Inject()
  private jravanRaceTool: JravanRaceTool;

  @Inject()
  private jravanShussoubaTool: JravanShussoubaTool;

  protected getBufferLength() {
    return 1308;
  }

  public async save(buffer: Buffer) {
    const race = await this.jravanRaceTool.getRace(buffer);
    if (!race) {
      this.logger.warn("成績１が取り込まれていないレースの成績２です");
      return;
    }
    const nen = readPositiveInt(buffer, 0, 4);
    const raceNengappi = readInt(buffer, 0, 8);
    for (let i = 0; i < 10; i++) {
      const uma = this.jravanShussoubaTool.slice(buffer, 16, i, jravanSeiUmaLength);
      if (!this.jravanShussoubaTool.hasUma(uma)) {
        continue;
      }
      const saved = await this.jravanShussoubaTool.saveShussoubaOf(uma, race, nen);
      if (saved) {
        await this.jravanShussoubaTool.saveSeisekiOf(uma, race, raceNengappi, saved);
      }
    }
  }
}
