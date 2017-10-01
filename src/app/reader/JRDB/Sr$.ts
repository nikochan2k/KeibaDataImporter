import { RaceData } from "./RaceData";
import { Race } from "../../entities/Race";

export abstract class Sr$ extends RaceData {

  protected async saveRaceRelated(buffer: Buffer, race: Race) {
    await this.tool.saveRaceLapTime(buffer, 8, race);
  }

}