import { Inject, Service } from "typedi";
import { Race } from "../../../entities/Race";
import { DataToImport } from "../../DataToImport";
import { readJikan, readPositiveInt, readRaw } from "../../Reader";
import { JravanRaceTool } from "./JravanRaceTool";
import { JravanShussoubaTool, jravanDenUmaLength } from "./JravanShussoubaTool";

/** 出馬表１ (JracDen1.dat): 出馬登録馬の一覧 (馬番 1〜18) */
@Service()
export class JravanDen1 extends DataToImport {
  @Inject()
  private jravanRaceTool: JravanRaceTool;

  @Inject()
  private jravanShussoubaTool: JravanShussoubaTool;

  protected getBufferLength() {
    return 1463;
  }

  public async save(buffer: Buffer) {
    const kaisai = await this.jravanRaceTool.saveKaisai(buffer);
    if (!kaisai) {
      return;
    }
    const toBe = await this.jravanRaceTool.createRaceWith(buffer, kaisai.Id);
    if (!toBe) {
      return;
    }
    toBe.YoteiHassouJikan = readJikan(buffer, 319);
    toBe.MaeuriFlag = readRaw(buffer, 323, 1) === "1" ? 1 : undefined;
    toBe.Tousuu = readPositiveInt(buffer, 324, 2);
    // 賞金は千円単位
    toBe.Shoukin1Chaku = readPositiveInt(buffer, 148, 7, 1000);
    toBe.Shoukin2Chaku = readPositiveInt(buffer, 155, 7, 1000);
    toBe.Shoukin3Chaku = readPositiveInt(buffer, 162, 7, 1000);
    toBe.Shoukin4Chaku = readPositiveInt(buffer, 169, 7, 1000);
    toBe.Shoukin5Chaku = readPositiveInt(buffer, 176, 7, 1000);
    toBe.FukaShou = readPositiveInt(buffer, 197, 7, 1000);

    const asIs = await this.entityManager.findOneBy(Race, { Id: toBe.Id });
    const race = await this.jravanRaceTool.saveOrUpdateRace(asIs, toBe);
    await this.jravanRaceTool.saveRaceMeiOf(buffer, 17, 60, race);

    for (let i = 0; i < 18; i++) {
      const uma = this.jravanShussoubaTool.slice(buffer, 327, i, jravanDenUmaLength);
      if (this.jravanShussoubaTool.hasUma(uma)) {
        await this.jravanShussoubaTool.saveJravanShussoubaOf(uma, race, kaisai.Nen);
      }
    }
  }
}
