import { Inject, Service } from "typedi";
import { EntityManager } from "typeorm";
import { OrmManager } from "typeorm-typedi-extensions";
import * as $C from "../../converters/Common";
import * as $SJ from "../../converters/ShussoubaJoutai";
import { Shussouba } from "../../entities/Shussouba";
import { Kubun } from "../../entities/ShussoubaJoutai";
import { ImportTool } from "../ImportTool";
import { Tool } from "../Tool";
import {
  readDouble,
  readPositiveInt,
} from "../Reader";

export interface OddsHaitouInfo {
  Kakutei: $C.Kakutei;
  Baken: $C.Baken;
  OddsOffset: number;
  OddsLength: number;
  NinkiOffset?: number;
  HaitoukinOffset?: number;
}

@Service()
export class JrdbTool {

  @OrmManager()
  protected entityManager: EntityManager;

  @Inject()
  private tool: Tool;

  @Inject()
  private importTool: ImportTool;

  public getDateFromFilename(basename: string) {
    const execed = /^[^0-9]+([0-9]{6})\.txt$/.exec(basename);
    if (!execed) {
      return null;
    }
    const yymmdd = parseInt(execed[1]);
    let yyyymmdd: number;
    if (700000 <= yymmdd) {
      yyyymmdd += 19000000;
    } else {
      yyyymmdd += 20000000;
    }
    return yyyymmdd;
  }

  public async saveOddsNinki(buffer: Buffer, shussouba: Shussouba, info: OddsHaitouInfo) {
    await this.tool.saveOddsHaitou({
      RaceId: shussouba.RaceId,
      Kakutei: info.Kakutei,
      Baken: info.Baken,
      Bangou1: shussouba.Umaban,
      Odds1: readDouble(buffer, info.OddsOffset, info.OddsLength),
      Ninki: (info.NinkiOffset ? readPositiveInt(buffer, info.NinkiOffset, 2) : undefined),
      Haitoukin: (info.HaitoukinOffset ? readPositiveInt(buffer, info.HaitoukinOffset, 7) : undefined)
    });
  }

  public async saveShussoubaJoutai(buffer: Buffer, shussoubaId: number, kubun: Kubun, offset: number) {
    let code: number;
    if (Kubun.TaikeiSougaou <= kubun && kubun <= Kubun.Tokki) {
      code = $SJ.tokki.toCodeFromJrdb(buffer, offset, 3);
    } else if (Kubun.Bagu <= kubun && kubun <= Kubun.BaguKotsuryuu) {
      code = $SJ.bagu.toCodeFromJrdb(buffer, offset, 3);
    } else if (Kubun.AshimotoSougou <= kubun && kubun <= Kubun.AshimotoMigiUshiro) {
      code = $SJ.ashimoto.toCodeFromJrdb(buffer, offset, 3);
    } else {
      // TODO ログ
      return;
    }
    await this.importTool.saveShussoubaJoutai(shussoubaId, kubun, code);
  }

}