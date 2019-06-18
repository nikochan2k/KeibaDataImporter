import { Race } from "../../entities/Race";
import { RaceSeiseki } from "../../entities/RaceSeiseki";
import { readStr } from "../Reader";
import { JrdbRaceData } from './JrdbRaceData';

export abstract class Sr$ extends JrdbRaceData {

  protected async saveRaceRelated(buffer: Buffer, race: Race) {
    await super.saveRaceSeiseki(buffer, race.Id);
    await this.jrdbRaceTool.saveRaceLapTime(buffer, 8, race);
  }

  protected setRaceSeiseki(buffer: Buffer, toBe: RaceSeiseki) {
    toBe.Ichidori1Corner = readStr(buffer, 62, 64);
    toBe.Ichidori2Corner = readStr(buffer, 126, 64);
    toBe.Ichidori3Corner = readStr(buffer, 190, 64);
    toBe.Ichidori4Corner = readStr(buffer, 254, 64);
  }

}