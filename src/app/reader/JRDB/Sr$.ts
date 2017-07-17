import { Inject } from "typedi";
import { JrdbRaceTool } from "./JrdbRaceTool";
import { JrdbTool } from "./JrdbTool";
import { Race } from "../../entities/Race";
import { Bridge } from "../Bridge";
import { DataToImport } from "../DataToImport";
import { Tool } from "../Tool";

export abstract class Sr$ extends DataToImport {

  @Inject()
  protected tool: Tool;

  @Inject()
  protected jrdbTool: JrdbTool;

  @Inject()
  protected jrdbRaceTool: JrdbRaceTool;

  public async save(buffer: Buffer, bridge: Bridge) {
    const asIs = await this.jrdbRaceTool.getRace(buffer);
    const dataSakuseiNengappi = this.jrdbTool.getDateFromFilename(bridge.basename);
    if (asIs) {
      if (dataSakuseiNengappi < asIs.JrdbSeisekiSakuseiNengappi) {
        this.logger.info("既に最新の成績レースデータが格納されています: " + asIs.Id);
        return null;
      }
    }

    const race = await this.saveRace(buffer, asIs, dataSakuseiNengappi);
    if (!race) {
      return null;
    }
    await this.jrdbRaceTool.saveRaceLapTime(buffer, 8, race);
    return race;
  }

  protected async saveRace(buffer: Buffer, asIs: Race, dataSakuseiNengappi: number) {
    let toBe = this.jrdbRaceTool.createRace(buffer);
    if (!toBe) {
      return null;
    }
    toBe.JrdbSeisekiSakuseiNengappi = dataSakuseiNengappi;
    this.setRace(buffer, toBe);

    if (asIs) {
      const updateSet = this.tool.createUpdateSet(asIs, toBe, true);
      if (updateSet) {
        await this.entityManager
          .createQueryBuilder()
          .update(Race, updateSet)
          .where("Id = :id")
          .setParameter("id", asIs.Id)
          .execute();
      }
      toBe = asIs;
    } else {
      toBe = await this.entityManager.save(toBe);
    }

    return toBe;
  }

  protected abstract setRace(buffer: Buffer, toBe: Race);

}