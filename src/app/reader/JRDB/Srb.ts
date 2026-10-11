import * as $R from "../../converters/Race";
import * as $S from "../../converters/Shussouba";
import { save } from "../../db/helpers";
import { Race } from "../../entities/Race";
import { RaceSeiseki } from "../../entities/RaceSeiseki";
import { RaceTrackBias } from "../../entities/RaceTrackBias";
import { readPositiveInt, readStr } from "../Reader";
import { Sr$ } from "./Sr$";

export class Srb extends Sr$ {
  protected getBufferLength() {
    return 852;
  }

  protected async saveRaceRelated(buffer: Buffer, race: Race) {
    await super.saveRaceRelated(buffer, race);
    await this.saveRaceTrackBiases(buffer, race);
  }

  protected setRaceSeiseki(buffer: Buffer, toBe: RaceSeiseki) {
    super.setRaceSeiseki(buffer, toBe);
    toBe.PaceUpNokoriFalon = readPositiveInt(buffer, 318, 2, 200);
    toBe.RaceComment = readStr(buffer, 342, 500);
  }

  protected async saveRaceTrackBiases(buffer: Buffer, race: Race) {
    const biasCodes = race.DirtShiba === $R.DirtShiba.Dirt ? $R.trackBiasDirt : $R.trackBias;
    let offset = 320;
    for (let midashi = $R.Midashi.DaiichiCorner; midashi <= $R.Midashi.DaisanCorner; midashi++) {
      for (let ichi = $S.Ichi.Uchi; ichi <= $S.Ichi.Soto; ichi++, offset++) {
        const trackBias = biasCodes.toCodeFromJrdb(buffer, offset, 1);
        if (trackBias === null) {
          continue;
        }
        await this.saveRaceTrackBias(race.Id, midashi, ichi, trackBias);
      }
    }
    for (let midashi = $R.Midashi.DaiyonCorner; midashi <= $R.Midashi.Chokusen; midashi++) {
      for (let ichi = $S.Ichi.Saiuchi; ichi <= $S.Ichi.Ohsoto; ichi++, offset++) {
        const trackBias = biasCodes.toCodeFromJrdb(buffer, offset, 1);
        if (trackBias === null) {
          continue;
        }
        await this.saveRaceTrackBias(race.Id, midashi, ichi, trackBias);
      }
    }
  }

  protected async saveRaceTrackBias(
    raceId: number,
    midashi: $R.Midashi,
    ichi: $S.Ichi,
    trackBias: number,
  ) {
    const rtb = {} as RaceTrackBias;
    rtb.Id = raceId * 2 ** (3 + 3) + midashi * 2 ** 3 + ichi;
    rtb.RaceId = raceId;
    rtb.Midashi = midashi;
    rtb.Ichi = ichi;
    rtb.TrackBias = trackBias;
    save(RaceTrackBias, rtb);
  }
}
