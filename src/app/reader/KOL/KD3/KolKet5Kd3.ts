import { Inject, Service } from "typedi";
import { EntityManager } from "typeorm";
import { OrmManager } from "typeorm-typedi-extensions";
import * as $U from "../../../converters/Uma";
import { UmaDao } from "../../../daos/UmaDao";
import { Uma } from "../../../entities/Uma";
import { DataToImport } from "../../DataToImport";
import { KolUmaTool } from "../KolUmaTool";
import {
  readInt,
  readStr,
} from "../../Reader";

@Service()
export class KolKet5Kd3 extends DataToImport {

  @OrmManager()
  protected entityManager: EntityManager;

  @Inject()
  private umaDao: UmaDao;

  @Inject()
  private kolUmaTool: KolUmaTool;

  protected getBufferLength() {
    return 4002;
  }

  public async save(buffer: Buffer) {
    const h = await this.saveH(buffer);
    const c = await this.saveC(buffer);

    const uma = new Uma();
    uma.KolUmaCode = readInt(buffer, 0, 7);
    uma.KanaBamei = readStr(buffer, 7, 37);
    uma.FamilyNumber = readStr(buffer, 44, 3);
    uma.SanchiCode = readStr(buffer, 47, 3);
    uma.ChichiUmaId = c.Id;
    uma.HahaUmaId = h.Id;
    await this.umaDao.saveUma(uma, true);
  }

  public async saveH(buffer: Buffer) {
    const hhh = await this.saveHhh(buffer);
    const hhc = await this.saveHhc(buffer);
    const hh = await this.kolUmaTool.saveSosenba123(buffer, 540, $U.Seibetsu.Hinba, hhc.Id, hhh.Id);

    const hch = await this.saveHch(buffer);
    const hcc = await this.saveHcc(buffer);
    const hc = await this.kolUmaTool.saveSosenba123(buffer, 442, $U.Seibetsu.Hinba, hcc.Id, hch.Id);

    return await this.kolUmaTool.saveSosenba123(buffer, 148, $U.Seibetsu.Hinba, hc.Id, hh.Id);
  }

  public async saveC(buffer: Buffer) {
    const chh = await this.saveChh(buffer);
    const chc = await this.saveChc(buffer);
    const ch = await this.kolUmaTool.saveSosenba123(buffer, 344, $U.Seibetsu.Hinba, chc.Id, chh.Id);

    const cch = await this.saveCch(buffer);
    const ccc = await this.saveCcc(buffer);
    const cc = await this.kolUmaTool.saveSosenba123(buffer, 246, $U.Seibetsu.Hinba, ccc.Id, cch.Id);

    return await this.kolUmaTool.saveSosenba123(buffer, 50, $U.Seibetsu.Hinba, cc.Id, ch.Id);
  }

  public async saveHhh(buffer: Buffer) {
    const hhhhh = await this.kolUmaTool.saveSosenba45(buffer, 3772, $U.Seibetsu.Hinba);
    const hhhhc = await this.kolUmaTool.saveSosenba45(buffer, 3722, $U.Seibetsu.Boba);
    const hhhh = await this.kolUmaTool.saveSosenba45(buffer, 2172, $U.Seibetsu.Hinba, hhhhc.Id, hhhhh.Id);

    const hhhch = await this.kolUmaTool.saveSosenba45(buffer, 3672, $U.Seibetsu.Hinba);
    const hhhcc = await this.kolUmaTool.saveSosenba45(buffer, 3622, $U.Seibetsu.Boba);
    const hhhc = await this.kolUmaTool.saveSosenba45(buffer, 2122, $U.Seibetsu.Boba, hhhcc.Id, hhhch.Id);

    return this.kolUmaTool.saveSosenba123(buffer, 1324, $U.Seibetsu.Hinba, hhhc.Id, hhhh.Id);
  }

  public async saveHhc(buffer: Buffer) {
    const hhchh = await this.kolUmaTool.saveSosenba45(buffer, 3572, $U.Seibetsu.Hinba);
    const hhchc = await this.kolUmaTool.saveSosenba45(buffer, 3522, $U.Seibetsu.Boba);
    const hhch = await this.kolUmaTool.saveSosenba45(buffer, 2072, $U.Seibetsu.Hinba, hhchc.Id, hhchh.Id);

    const hhcch = await this.kolUmaTool.saveSosenba45(buffer, 3472, $U.Seibetsu.Hinba);
    const hhccc = await this.kolUmaTool.saveSosenba45(buffer, 3422, $U.Seibetsu.Boba);
    const hhcc = await this.kolUmaTool.saveSosenba45(buffer, 2022, $U.Seibetsu.Hinba, hhccc.Id, hhcch.Id);

    return this.kolUmaTool.saveSosenba123(buffer, 1226, $U.Seibetsu.Hinba, hhcc.Id, hhch.Id);
  }

  public async saveHch(buffer: Buffer) {
    const hchhh = await this.kolUmaTool.saveSosenba45(buffer, 3372, $U.Seibetsu.Hinba);
    const hchhc = await this.kolUmaTool.saveSosenba45(buffer, 3322, $U.Seibetsu.Boba);
    const hchh = await this.kolUmaTool.saveSosenba45(buffer, 1972, $U.Seibetsu.Hinba, hchhc.Id, hchhh.Id);

    const hchch = await this.kolUmaTool.saveSosenba45(buffer, 3272, $U.Seibetsu.Hinba);
    const hchcc = await this.kolUmaTool.saveSosenba45(buffer, 3222, $U.Seibetsu.Boba);
    const hchc = await this.kolUmaTool.saveSosenba45(buffer, 1922, $U.Seibetsu.Hinba, hchcc.Id, hchch.Id);

    return this.kolUmaTool.saveSosenba123(buffer, 1128, $U.Seibetsu.Hinba, hchh.Id, hchc.Id);
  }

  public async saveHcc(buffer: Buffer) {
    const hcchh = await this.kolUmaTool.saveSosenba45(buffer, 3172, $U.Seibetsu.Hinba);
    const hcchc = await this.kolUmaTool.saveSosenba45(buffer, 3122, $U.Seibetsu.Boba);
    const hcch = await this.kolUmaTool.saveSosenba45(buffer, 1872, $U.Seibetsu.Hinba, hcchc.Id, hcchh.Id);

    const hccch = await this.kolUmaTool.saveSosenba45(buffer, 3072, $U.Seibetsu.Hinba);
    const hcccc = await this.kolUmaTool.saveSosenba45(buffer, 3022, $U.Seibetsu.Boba);
    const hccc = await this.kolUmaTool.saveSosenba45(buffer, 1822, $U.Seibetsu.Hinba, hcccc.Id, hccch.Id);

    return this.kolUmaTool.saveSosenba123(buffer, 1030, $U.Seibetsu.Hinba, hccc.Id, hcch.Id);
  }

  public async saveChh(buffer: Buffer) {
    const chhhh = await this.kolUmaTool.saveSosenba45(buffer, 2972, $U.Seibetsu.Hinba);
    const chhhc = await this.kolUmaTool.saveSosenba45(buffer, 2922, $U.Seibetsu.Boba);
    const chhh = await this.kolUmaTool.saveSosenba45(buffer, 1772, $U.Seibetsu.Hinba, chhhc.Id, chhhh.Id);

    const chhch = await this.kolUmaTool.saveSosenba45(buffer, 2872, $U.Seibetsu.Hinba);
    const chhcc = await this.kolUmaTool.saveSosenba45(buffer, 2822, $U.Seibetsu.Boba);
    const chhc = await this.kolUmaTool.saveSosenba45(buffer, 1722, $U.Seibetsu.Boba, chhcc.Id, chhch.Id);

    return this.kolUmaTool.saveSosenba123(buffer, 932, $U.Seibetsu.Hinba, chhc.Id, chhh.Id);
  }

  public async saveChc(buffer: Buffer) {
    const chchh = await this.kolUmaTool.saveSosenba45(buffer, 2772, $U.Seibetsu.Hinba);
    const chchc = await this.kolUmaTool.saveSosenba45(buffer, 2722, $U.Seibetsu.Boba);
    const chch = await this.kolUmaTool.saveSosenba45(buffer, 1672, $U.Seibetsu.Hinba, chchc.Id, chchh.Id);

    const chcch = await this.kolUmaTool.saveSosenba45(buffer, 2672, $U.Seibetsu.Hinba);
    const chccc = await this.kolUmaTool.saveSosenba45(buffer, 2622, $U.Seibetsu.Boba);
    const chcc = await this.kolUmaTool.saveSosenba45(buffer, 1622, $U.Seibetsu.Boba, chccc.Id, chcch.Id);

    return this.kolUmaTool.saveSosenba123(buffer, 834, $U.Seibetsu.Hinba, chcc.Id, chch.Id);
  }

  public async saveCch(buffer: Buffer) {
    const cchhh = await this.kolUmaTool.saveSosenba45(buffer, 2572, $U.Seibetsu.Hinba);
    const cchhc = await this.kolUmaTool.saveSosenba45(buffer, 2522, $U.Seibetsu.Boba);
    const cchh = await this.kolUmaTool.saveSosenba45(buffer, 1572, $U.Seibetsu.Hinba, cchhc.Id, cchhh.Id);

    const cchch = await this.kolUmaTool.saveSosenba45(buffer, 2472, $U.Seibetsu.Hinba);
    const cchcc = await this.kolUmaTool.saveSosenba45(buffer, 2422, $U.Seibetsu.Boba);
    const cchc = await this.kolUmaTool.saveSosenba45(buffer, 1522, $U.Seibetsu.Boba, cchcc.Id, cchch.Id);

    return this.kolUmaTool.saveSosenba123(buffer, 736, $U.Seibetsu.Hinba, cchc.Id, cchh.Id);
  }

  public async saveCcc(buffer: Buffer) {
    const ccchh = await this.kolUmaTool.saveSosenba45(buffer, 2372, $U.Seibetsu.Hinba);
    const ccchc = await this.kolUmaTool.saveSosenba45(buffer, 2322, $U.Seibetsu.Boba);
    const ccch = await this.kolUmaTool.saveSosenba45(buffer, 1472, $U.Seibetsu.Hinba, ccchc.Id, ccchh.Id);

    const cccch = await this.kolUmaTool.saveSosenba45(buffer, 2272, $U.Seibetsu.Hinba);
    const ccccc = await this.kolUmaTool.saveSosenba45(buffer, 2222, $U.Seibetsu.Boba);
    const cccc = await this.kolUmaTool.saveSosenba45(buffer, 1422, $U.Seibetsu.Boba, ccccc.Id, cccch.Id);

    return this.kolUmaTool.saveSosenba123(buffer, 638, $U.Seibetsu.Hinba, cccc.Id, ccch.Id);
  }
}