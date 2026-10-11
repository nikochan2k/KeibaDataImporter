import { Inject, Service } from "typedi";
import { DataToImport } from "../../DataToImport";
import { readPositiveInt } from "../../Reader";
import { JravanRaceTool } from "./JravanRaceTool";
import { JravanShussoubaTool, jravanDenUmaLength } from "./JravanShussoubaTool";

/** 出馬表２ (JracDen2.dat): 出馬登録馬が 18 頭を超える場合の馬番 19〜28 */
@Service()
export class JravanDen2 extends DataToImport {
  @Inject()
  private jravanRaceTool: JravanRaceTool;

  @Inject()
  private jravanShussoubaTool: JravanShussoubaTool;

  protected getBufferLength() {
    return 648;
  }

  public async save(buffer: Buffer) {
    const race = await this.jravanRaceTool.getRace(buffer);
    if (!race) {
      this.logger.warn("出馬表１が取り込まれていないレースの出馬表２です");
      return;
    }
    const nen = readPositiveInt(buffer, 0, 4);
    for (let i = 0; i < 10; i++) {
      const uma = this.jravanShussoubaTool.slice(buffer, 16, i, jravanDenUmaLength);
      if (this.jravanShussoubaTool.hasUma(uma)) {
        await this.jravanShussoubaTool.saveJravanShussoubaOf(uma, race, nen);
      }
    }
  }
}
