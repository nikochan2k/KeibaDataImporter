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
export class KolCom1Kd3 extends DataToImport {

  @Inject()
  private tool: Tool;

  @Inject()
  private jrdbTool: JrdbTool;

  @Inject()
  private jrdbRaceTool: JrdbRaceTool;

  protected getBufferLength() {
    return 852;
  }

  protected async save(buffer: Buffer, bridge: Bridge) {
    const asIs = await this.jrdbRaceTool.getRace(buffer);
    const dataSakuseiNengappi = this.jrdbTool.getDateFromFilename(bridge.basename);
    if (asIs) {
      if (dataSakuseiNengappi < asIs.JrdbSeisekiSakuseiNengappi) {
        this.logger.info("既に最新の成績レースデータが格納されています: " + asIs.Id);
        return;
      }
    }

    const race = await this.saveRace(buffer, asIs, dataSakuseiNengappi);
    if (!race) {
      return;
    }
    await this.jrdbRaceTool.saveNormalRaceLapTime(buffer, 8, race);
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