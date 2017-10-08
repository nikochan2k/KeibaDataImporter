import * as $C from "../../converters/Common";
import * as $S from "../../converters/Shussouba";
import { RaceSeiseki } from "../../entities/RaceSeiseki";
import { Shussouba } from "../../entities/Shussouba";
import { ShussoubaSeiseki } from "../../entities/ShussoubaSeiseki";
import { ShussoubaHyouka } from "../../entities/ShussoubaHyouka";
import { ShussoubaInfo } from "../ImportTool";
import { Se$ } from "./Se$";
import {
  readInt,
} from "../Reader";

export class Sed extends Se$ {

  protected getBufferLength() {
    return 376;
  }

  protected setRaceSeiseki(buffer: Buffer, toBe: RaceSeiseki) {
    toBe.PaceNagare = readInt(buffer, 365, 2);
  }

  protected setShussoubaSeiseki(buffer: Buffer, toBe: ShussoubaSeiseki, info: ShussoubaInfo) {
    super.setShussoubaSeiseki(buffer, toBe, info);
    toBe.HonShoukin = readInt(buffer, 355, 5, 10000);
    toBe.ShuutokuShoukin = readInt(buffer, 360, 5, 10000);
    toBe.YonCornerIchiDori = $S.ichi.toCodeFromJrdb(buffer, 369, 1);
  }

  protected setShussoubaHyouka(buffer: Buffer, toBe: ShussoubaHyouka) {
    super.setShussoubaHyouka(buffer, toBe);
    toBe.PaceNagare = readInt(buffer, 367, 2);
  }

  protected async saveOddsHaitou(buffer: Buffer, shussouba: Shussouba) {
    await this.jrdbTool.saveOddsNinki(buffer, shussouba, {
      Kakutei: $C.Kakutei.Kakutei,
      Baken: $C.Baken.Tanshou,
      OddsOffset: 174,
      OddsLength: 6,
      NinkiOffset: 180,
      HaitoukinOffset: 341
    });
    await this.jrdbTool.saveOddsNinki(buffer, shussouba, {
      Kakutei: $C.Kakutei.Kakutei,
      Baken: $C.Baken.Fukushou,
      OddsOffset: 290,
      OddsLength: 6,
      HaitoukinOffset: 348
    });
    await this.jrdbTool.saveOddsNinki(buffer, shussouba, {
      Kakutei: $C.Kakutei.ToujitsuAM,
      Baken: $C.Baken.Tanshou,
      OddsOffset: 296,
      OddsLength: 6
    });
    await this.jrdbTool.saveOddsNinki(buffer, shussouba, {
      Kakutei: $C.Kakutei.ToujitsuAM,
      Baken: $C.Baken.Fukushou,
      OddsOffset: 302,
      OddsLength: 6
    });
  }

}