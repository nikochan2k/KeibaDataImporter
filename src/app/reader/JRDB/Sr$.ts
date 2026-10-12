import { upsertLater } from "../../db/helpers";
import { Race } from "../../entities/Race";
import { RaceKeika } from "../../entities/RaceKeika";
import { keikaTool } from "../KeikaTool";
import { readStr } from "../Reader";

import { JrdbRaceData } from "./JrdbRaceData";
import { jrdbRaceTool } from "./JrdbRaceTool";

export abstract class Sr$ extends JrdbRaceData {
  protected async saveRaceRelated(buffer: Buffer, race: Race) {
    await super.saveRaceSeiseki(buffer, race.Id);
    await jrdbRaceTool.saveRaceLapTime(buffer, 8, race);
    await this.saveCornerIchidori(buffer, race);
  }

  private async saveCornerIchidori(buffer: Buffer, race: Race) {
    await this.saveRaceKeika(buffer, 62, 64, race, 12); // 1角
    await this.saveRaceKeika(buffer, 126, 64, race, 2); // 2角
    await this.saveRaceKeika(buffer, 190, 64, race, 3); // 3角
    await this.saveRaceKeika(buffer, 254, 64, race, 4); // 4角
  }

  private async saveRaceKeika(
    buffer: Buffer,
    offset: number,
    length: number,
    race: Race,
    midashi2: number,
  ) {
    let keika = readStr(buffer, offset, length);
    if (!keika) {
      return;
    }
    keika = keika.replace(/\s+/g, "=");
    const toBe = {} as RaceKeika;
    toBe.Id = race.Id * 2 ** 7 + midashi2;
    toBe.RaceId = race.Id;
    toBe.Midashi2 = midashi2;
    toBe.Keika = keika;
    upsertLater(RaceKeika, toBe);

    await keikaTool.parseRaceKeika(toBe);
  }
}
