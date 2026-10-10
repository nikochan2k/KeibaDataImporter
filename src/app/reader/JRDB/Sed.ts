import { Service } from "typedi";
import * as $C from "../../converters/Common";
import * as $S from "../../converters/Shussouba";
import { Race } from "../../entities/Race";
import { RaceSeiseki } from "../../entities/RaceSeiseki";
import { Shussouba } from "../../entities/Shussouba";
import { ShussoubaHyouka } from "../../entities/ShussoubaHyouka";
import { ShussoubaSeiseki } from "../../entities/ShussoubaSeiseki";
import { readInt, readJikan } from "../Reader";
import { Se$ } from "./Se$";

@Service()
export class Sed extends Se$ {
  protected getBufferLength() {
    return 376;
  }

  protected setRace(buffer: Buffer, toBe: Race) {
    super.setRace(buffer, toBe);
    toBe.HassouJikan = readJikan(buffer, 370);
  }

  protected setRaceSeiseki(buffer: Buffer, toBe: RaceSeiseki) {
    super.setRaceSeiseki(buffer, toBe);
    toBe.PaceNagare = readInt(buffer, 365, 2);
  }

  protected async setShussoubaSeiseki(buffer: Buffer, toBe: ShussoubaSeiseki) {
    await super.setShussoubaSeiseki(buffer, toBe);
    toBe.HonShoukin = readInt(buffer, 355, 5, 10000);
    toBe.ShuutokuShoukin = readInt(buffer, 360, 5, 10000);
    toBe.YonCornerIchiDori = $S.ichi.toCodeFromJrdb(buffer, 369, 1);
  }

  protected setShussoubaHyouka(buffer: Buffer, toBe: ShussoubaHyouka) {
    super.setShussoubaHyouka(buffer, toBe);
    toBe.PaceNagare = readInt(buffer, 367, 2);
  }

  protected async saveOddsHaitou(buffer: Buffer, shussouba: Shussouba) {
    await this.jrdbOddsHaitouTool.saveOddsNinki(buffer, shussouba, {
      Kakutei: $C.Kakutei.Kakutei,
      Baken: $C.Baken.Tanshou,
      OddsOffset: 174,
      OddsLength: 6,
      NinkiOffset: 180,
      HaitoukinOffset: 341,
    });
    await this.jrdbOddsHaitouTool.saveOddsNinki(buffer, shussouba, {
      Kakutei: $C.Kakutei.Kakutei,
      Baken: $C.Baken.Fukushou,
      OddsOffset: 290,
      OddsLength: 6,
      HaitoukinOffset: 348,
    });
    await this.jrdbOddsHaitouTool.saveOddsNinki(buffer, shussouba, {
      Kakutei: $C.Kakutei.ToujitsuAM,
      Baken: $C.Baken.Tanshou,
      OddsOffset: 296,
      OddsLength: 6,
    });
    await this.jrdbOddsHaitouTool.saveOddsNinki(buffer, shussouba, {
      Kakutei: $C.Kakutei.ToujitsuAM,
      Baken: $C.Baken.Fukushou,
      OddsOffset: 302,
      OddsLength: 6,
    });
  }
}
