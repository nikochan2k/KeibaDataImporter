import { Service } from "typedi";
import { Sr$ } from "./Sr$";
import { RaceSeiseki } from '../../entities/RaceSeiseki';
import { Race } from '../../entities/Race';

@Service()
export class Sra extends Sr$ {

  protected getBufferLength() {
    return 408;
  }

  protected async saveRaceSeiseki(buffer: Buffer, race: Race) {
    const toBe = new RaceSeiseki();
    toBe.Id = race.Id;
    this.setRaceSeiseki(buffer, toBe);

    const asIs = await this.entityManager.findOne(RaceSeiseki, toBe.Id);

    await this.tool.saveOrUpdate(RaceSeiseki, asIs, toBe);
  }
}