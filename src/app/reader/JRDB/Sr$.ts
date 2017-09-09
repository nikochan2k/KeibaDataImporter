import { RaceData } from "./RaceData";
import { Race } from "../../entities/Race";

export abstract class Sr$ extends RaceData {

  protected async saveRaceRelated(buffer: Buffer, race: Race) {
    await this.jrdbRaceTool.saveRaceLapTime(buffer, 8, race);
  }

}