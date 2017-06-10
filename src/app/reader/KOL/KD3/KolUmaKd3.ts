import "reflect-metadata";
import { Inject, Service } from "typedi";
import { EntityManager } from "typeorm";
import { OrmEntityManager } from "typeorm-typedi-extensions";
import * as $U from "../../../converters/Uma";
import { Uma } from "../../../entities/Uma";
import { UmaDao } from "../../../daos/UmaDao";
import { DataToImport } from "../../DataToImport";
import { readDate, readStr } from "../../Reader";
import { KolTool } from "../KolTool";

@Service()
export class KolUmaKd3 extends DataToImport {

  @OrmEntityManager()
  private entityManager: EntityManager;

  @Inject()
  private kolTool: KolTool;

  @Inject()
  private umaDao: UmaDao;

  protected getBufferLength() {
    return 5166;
  }

  protected async saveOyaUma(buffer: Buffer, offset: number, seibetsu: $U.Seibetsu, chichiOffset?: number, hahaOffset?: number) {
    let uma = new Uma();
    uma.Bamei = readStr(buffer, offset, 34);
    uma = await this.umaDao.saveUma(uma);

    let needPersist = !uma.Id;
    if (chichiOffset && !uma.ChichiUma) {
      uma.ChichiUma = await this.saveOyaUma(buffer, chichiOffset, $U.Seibetsu.Boba);
      needPersist = true;
    }
    if (hahaOffset && !uma.HahaUma) {
      uma.HahaUma = await this.saveOyaUma(buffer, hahaOffset, $U.Seibetsu.Hinba);
      needPersist = true;
    }

    if (needPersist) {
      uma.Seibetsu = seibetsu;
      uma = await this.entityManager.persist(uma);
    }

    return uma;
  }

  protected async save(buffer: Buffer) {
    const uma = new Uma();
    uma.Bamei = readStr(buffer, 7, 30);
    uma.KyuuBamei = readStr(buffer, 37, 40);
    uma.Seinengappi = readDate(buffer, 77, 8);
    uma.Keiro = $U.keiro.toCodeFromKol(buffer, 85, 2);
    uma.Kesshu = $U.kesshu.toCodeFromKol(buffer, 87, 2);
    uma.Sanchi = $U.sanch.toCodeFromKol(buffer, 89, 3);
    uma.UmaKigou = $U.umaKigou.toCodeFromKol(buffer, 92, 2);
    uma.Seibetsu = $U.seibetsu.toCodeFromKol(buffer, 94, 1);
    uma.ChichiUma = await this.saveOyaUma(buffer, 104, $U.Seibetsu.Boba);
    uma.HahaUma = await this.saveOyaUma(buffer, 145, $U.Seibetsu.Hinba, 186, 227);
    uma.Banushi = await this.kolTool.saveBanushi(buffer, 343);
    uma.Seisansha = await this.kolTool.saveSeisansha(buffer, 423);
    uma.Kyuusha = await this.kolTool.saveKyuusha(buffer, 488);
    uma.KoueiGaikokuKyuushaMei = readStr(buffer, 536, 8);
    uma.MasshouFlag = $U.masshouFlag.toCodeFromKol(buffer, 544, 1);
    uma.MasshouNengappi = readDate(buffer, 545, 8);
    uma.Jiyuu = readStr(buffer, 553, 6);
    uma.Ikisaki = readStr(buffer, 559, 10);
    await this.umaDao.saveUma(uma);
  }
}
