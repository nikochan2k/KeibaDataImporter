import { Service } from "typedi";
import * as $C from "../../converters/Common";
import * as $R from "../../converters/Race";
import { Race } from "../../entities/Race";
import { RaceTrackBias } from "../../entities/RaceTrackBias";
import { Bridge } from "../Bridge";
import { readPositiveInt, readStr } from "../Reader";
import { Sr$ } from "./Sr$";

@Service()
export class Srb extends Sr$ {

  protected getBufferLength() {
    return 852;
  }

  public async save(buffer: Buffer, bridge: Bridge) {
    const race = await super.save(buffer, bridge);
    await this.saveRaceTrackBiases(buffer, race);
    return race;
  }

  protected async saveRaceTrackBiases(buffer: Buffer, race: Race) {
    let offset = 320;
    for (let midashi = $R.Midashi.DaiichiCorner; midashi <= $R.Midashi.DaisanCorner; midashi++) {
      for (let ichi = $C.Ichi.Uchi; ichi <= $C.Ichi.Soto; ichi++ , offset++) {
        const trackBias = $R.trackBias.toCodeFromJrdb(buffer, offset, 1);
        if (trackBias === null) {
          continue;
        }
        await this.saveRaceTrackBias(race.Id, midashi, ichi, trackBias);
      }
    }
    for (let midashi = $R.Midashi.DaiyonCorner; midashi <= $R.Midashi.Chokusen; midashi++) {
      for (let ichi = $C.Ichi.Saiuchi; ichi <= $C.Ichi.Ohsoto; ichi++ , offset++) {
        const trackBias = $R.trackBias.toCodeFromJrdb(buffer, offset, 1);
        if (trackBias === null) {
          continue;
        }
        await this.saveRaceTrackBias(race.Id, midashi, ichi, trackBias);
      }
    }
  }

  protected setRace(buffer: Buffer, toBe: Race) {
    toBe.PaceUpNokoriFalon = readPositiveInt(buffer, 318, 2, 200);
    toBe.RaceComment = readStr(buffer, 342, 500);
  }

  protected async saveRaceTrackBias(raceId: number, midashi: number, ichi: number, trackBias: number) {
    const rtb = new RaceTrackBias();
    rtb.Id = raceId * (2 ** (3 + 3)) + midashi * (2 ** 3) + ichi;
    rtb.RaceId = raceId;
    rtb.Midashi = midashi;
    rtb.Ichi = ichi;
    rtb.TrackBias = trackBias;
    await this.entityManager.save(rtb);
  }

}