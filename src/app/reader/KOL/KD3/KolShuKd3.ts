import { Inject, Service } from "typedi";
import { EntityManager } from "typeorm";
import { OrmManager } from "typeorm-typedi-extensions";
import * as $C from "../../../converters/Common";
import * as $U from "../../../converters/Uma";
import { UmaDao } from "../../../daos/UmaDao";
import { Uma } from "../../../entities/Uma";
import { DataToImport } from "../../DataToImport";
import { Tool } from "../../Tool";
import { KolUmaTool } from "../KolUmaTool";
import {
  readPositiveInt,
  readStr,
} from "../../Reader";

@Service()
export class KolShuKd3 extends DataToImport {

  @OrmManager()
  protected entityManager: EntityManager;

  @Inject()
  private tool: Tool;

  @Inject()
  private umaDao: UmaDao;

  @Inject()
  private kolUmaTool: KolUmaTool;

  protected getBufferLength() {
    return 2010;
  }

  public async save(buffer: Buffer) {
    let uma = new Uma();
    const bamei = readStr(buffer, 7, 34);
    if (this.tool.isEnglish(bamei)) {
      uma.EigoBamei = bamei;
    } else {
      uma.KanaBamei = bamei;
    }
    uma.Seinen = readPositiveInt(buffer, 41, 4);
    uma.Keiro = $U.keiro.toCodeFromKol(buffer, 45, 2);
    uma.Sanchi = $U.sanch.toCodeFromKol(buffer, 47, 3);
    uma.YunyuubaFlag = $U.yunyuubaFlag.toCodeFromKol(buffer, 50, 1);
    uma.Seibetsu = $U.Seibetsu.Boba;
    const chichiUma = await this.kolUmaTool.saveOyaUma(buffer, 51, $U.Seibetsu.Boba);
    uma.ChichiUmaId = chichiUma && chichiUma.Id;
    const hahaUma = await this.kolUmaTool.saveOyaUma(buffer, 92, $U.Seibetsu.Hinba);
    uma.HahaUmaId = hahaUma && hahaUma.Id;
    uma.KyoriTekisei = $U.kyoriTekisei.toCodeFromKol(buffer, 133, 1);
    uma.OmoKousetsu = $C.hyouka.toCodeFromKol(buffer, 134, 1);
    uma.DirtKousetsu = $C.hyouka.toCodeFromKol(buffer, 135, 1);
    uma.ShibouNen = readPositiveInt(buffer, 136, 4);
    uma = await this.umaDao.saveUma(uma);
  }

}