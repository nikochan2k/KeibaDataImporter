import { Inject } from "typedi";
import { JrdbRaceData } from "./JrdbRaceData";
import { Race } from "../../entities/Race";
import { RaceKeika } from "../../entities/RaceKeika";
import { KeikaTool } from "../KeikaTool";
import { readStr } from "../Reader";

export abstract class Sr$ extends JrdbRaceData {

  @Inject()
  private keikaTool: KeikaTool;

  protected async saveRaceRelated(buffer: Buffer, race: Race) {
    await super.saveRaceSeiseki(buffer, race.Id);
    await this.jrdbRaceTool.saveRaceLapTime(buffer, 8, race);
    await this.saveCornerIchidori(buffer, race);
  }

  private async saveCornerIchidori(buffer: Buffer, race: Race) {
    await this.saveRaceKeika(buffer, 62, 64, race, 12); // 1角
    await this.saveRaceKeika(buffer, 126, 64, race, 2); // 2角
    await this.saveRaceKeika(buffer, 190, 64, race, 3); // 3角
    await this.saveRaceKeika(buffer, 254, 64, race, 4); // 4角
  }

  private async saveRaceKeika(buffer: Buffer, offset: number, length: number, race: Race, midashi2: number) {
    let keika = readStr(buffer, offset, length);
    if (!keika) {
      return;
    }
    keika = keika.replace(/\s+/g, "=");
    const toBe = new RaceKeika();
    toBe.Id = race.Id * (2 ** 7) + midashi2;
    toBe.RaceId = race.Id;
    toBe.Midashi2 = midashi2;
    toBe.Keika = keika;
    const asIs = await this.entityManager.findOne(RaceKeika, toBe.Id);
    await this.tool.saveOrUpdate(RaceKeika, asIs, toBe);

    await this.keikaTool.parseRaceKeika(toBe);
  }

}