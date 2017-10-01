import { Inject, Service } from "typedi";
import { EntityManager } from "typeorm";
import { OrmEntityManager } from "typeorm-typedi-extensions";
import * as $C from "../../converters/Common";
import * as $SJ from "../../converters/ShussoubaJoutai";
import { Shussouba } from "../../entities/Shussouba";
import { ShussoubaJoutai, Kubun } from "../../entities/ShussoubaJoutai";
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

  @OrmEntityManager()
  protected entityManager: EntityManager;

  @Inject()
  private tool: Tool;

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

  public async saveShussoubaJoutai(buffer: Buffer, shussoubaId: number, kubun: Kubun, bangou: number, offset: number) {
    const id = shussoubaId * (2 ** (4 + 3)) + kubun * (2 ** 3) + bangou;
    const toBe = new ShussoubaJoutai();
    toBe.Id = id;
    toBe.ShussoubaId = shussoubaId;
    toBe.Kubun = kubun;
    toBe.Bangou = bangou;
    if (Kubun.TaikeiSougaou <= kubun && kubun <= Kubun.Tokki) {
      toBe.Code = $SJ.tokki.toCodeFromJrdb(buffer, offset, 3);
    } else if (Kubun.Bagu <= kubun && kubun <= Kubun.BaguKotsuryuu) {
      toBe.Code = $SJ.bagu.toCodeFromJrdb(buffer, offset, 3);
    } else if (Kubun.AshimotoSougou <= kubun && kubun <= Kubun.AshimotoMigiUshiro) {
      toBe.Code = $SJ.ashimoto.toCodeFromJrdb(buffer, offset, 3);
    } else {
    }

    const asIs = await this.entityManager.findOneById(ShussoubaJoutai, id);
    if (asIs) {
      await this.tool.update(ShussoubaJoutai, asIs, toBe);
    } else {
      await this.entityManager.save(toBe);
    }
  }

}