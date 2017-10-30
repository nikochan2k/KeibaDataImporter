import { Inject, Service } from "typedi";
import { EntityManager } from "typeorm";
import { OrmManager } from "typeorm-typedi-extensions";
import * as $U from "../../../converters/Uma";
import { UmaDao } from "../../../daos/UmaDao";
import { Uma } from "../../../entities/Uma";
import { DataToImport } from "../../DataToImport";
import { Tool } from "../../Tool";
import { KolUmaTool } from "../KolUmaTool";
import {
  readInt,
  readStr,
} from "../../Reader";

@Service()
export class KolKetKd3 extends DataToImport {

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
    const hhh = await this.kolUmaTool.saveSosenba23(buffer, 667, $U.Seibetsu.Hinba);
    const hhc = await this.kolUmaTool.saveSosenba23(buffer, 625, $U.Seibetsu.Boba);
    const hh = await this.kolUmaTool.saveSosenba23(buffer, 332, $U.Seibetsu.Hinba, hhc.Id, hhh.Id);

    const hch = await this.kolUmaTool.saveSosenba23(buffer, 583, $U.Seibetsu.Hinba);
    const hcc = await this.kolUmaTool.saveSosenba23(buffer, 542, $U.Seibetsu.Boba);
    const hc = await this.kolUmaTool.saveSosenba23(buffer, 289, $U.Seibetsu.Boba, hcc.Id, hch.Id);

    const chh = await this.kolUmaTool.saveSosenba23(buffer, 499, $U.Seibetsu.Hinba);
    const chc = await this.kolUmaTool.saveSosenba23(buffer, 457, $U.Seibetsu.Boba);
    const ch = await this.kolUmaTool.saveSosenba23(buffer, 247, $U.Seibetsu.Hinba, chc.Id, chh.Id);

    const cch = await this.kolUmaTool.saveSosenba23(buffer, 415, $U.Seibetsu.Hinba);
    const ccc = await this.kolUmaTool.saveSosenba23(buffer, 373, $U.Seibetsu.Boba);
    const cc = await this.kolUmaTool.saveSosenba23(buffer, 205, $U.Seibetsu.Hinba, ccc.Id, cch.Id);

    const h = await this.kolUmaTool.saveSosenba1(buffer, 121, $U.Seibetsu.Hinba, hc.Id, hh.Id);
    const c = await this.kolUmaTool.saveSosenba1(buffer, 37, $U.Seibetsu.Boba, cc.Id, ch.Id);

    const uma = new Uma();
    uma.KolUmaCode = readInt(buffer, 0, 7);
    const bamei = readStr(buffer, 7, 30);
    if (this.tool.isEnglish(bamei)) {
      uma.EigoBamei = bamei;
    } else {
      uma.KanaBamei = bamei;
    }
    uma.ChichiUmaId = c.Id;
    uma.HahaUmaId = h.Id;
    await this.umaDao.saveUma(uma, true);
  }

}