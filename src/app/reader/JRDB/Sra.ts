import { Inject, Service } from "typedi";
import { DataToImport } from "../DataToImport";
import { Bridge } from "../Bridge";
import { Race } from "../../entities/Race";
import { Tool } from "../Tool";
import {
  readStr,
  readPositiveInt
} from "../Reader";
import { JrdbRaceTool } from "./JrdbRaceTool";
import { JrdbTool } from "./JrdbTool";

@Service()
export class Sra extends DataToImport {

  @Inject()
  protected tool: Tool;

  @Inject()
  protected jrdbTool: JrdbTool;

  @Inject()
  protected jrdbRaceTool: JrdbRaceTool;

  protected getBufferLength() {
    return 852;
  }

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
    toBe.PaceUpNokoriFalon = readPositiveInt(buffer, 318, 2, 200);
    toBe.RaceComment = readStr(buffer, 342, 500);

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

}