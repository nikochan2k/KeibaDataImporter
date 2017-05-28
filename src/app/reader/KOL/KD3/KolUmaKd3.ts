import { EntityManager } from "typeorm";
import { readDate, readStr } from "../../ReadTool";
import { KolReader } from "../KolReader";
import * as $U from "../../../converters/Uma";

export class KolUmaKd3 extends KolReader {

  constructor(entityManager: EntityManager, fd: number) {
    super(entityManager, fd);
  }

  protected getBufferLength() {
    return 5166;
  }

  protected async saveOyaUma(buffer: Buffer, offset: number, seibetsu: $U.Seibetsu, chichiOffset?: number, hahaOffset?: number) {
    const bamei = readStr(buffer, offset, 34);
    let uma = await this.support.getUma(bamei);

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
    const dataSakuseiNengappi = readDate(buffer, 624, 8);
    const kanaBamei = readStr(buffer, 7, 30);
    const uma = await this.support.getUma(kanaBamei);
    if (dataSakuseiNengappi <= uma.DataSakuseiNengappi) {
      this.logger.debug("既に最新の競走馬データが格納されています: " + kanaBamei);
      return;
    }
    uma.KanaBamei = kanaBamei;
    uma.KyuuBamei = readStr(buffer, 37, 40);
    uma.Seinengappi = readDate(buffer, 77, 8);
    uma.Keiro = $U.keiro.toCodeFromKol(buffer, 85, 2);
    uma.Kesshu = $U.kesshu.toCodeFromKol(buffer, 87, 2);
    uma.Sanchi = $U.sanch.toCodeFromKol(buffer, 89, 3);
    uma.UmaKigou = $U.umaKigou.toCodeFromKol(buffer, 92, 2);
    uma.Seibetsu = $U.seibetsu.toCodeFromKol(buffer, 94, 1);
    uma.ChichiUma = await this.saveOyaUma(buffer, 104, $U.Seibetsu.Boba);
    uma.HahaUma = await this.saveOyaUma(buffer, 145, $U.Seibetsu.Hinba, 186, 227);
    uma.Banushi = await this.saveKolBanushi(buffer, { meishou: 343, tanshuku: 383 });
    uma.Seisansha = await this.saveKolSeisansha(buffer, { meishou: 423, tanshuku: 463 });
    uma.Kyuusha = await this.saveKolKyuusha(buffer, {
      kolKyuushaCode: 488, meishou: 493, tanshuku: 525, shozokuBasho: 533, ritsuHokuNanBetsu: 535
    });
    uma.KoueiGaikokuKyuushaMei = readStr(buffer, 536, 8);
    uma.MasshouFlag = $U.masshouFlag.toCodeFromKol(buffer, 544, 1);
    uma.MasshouNengappi = readDate(buffer, 545, 8);
    uma.Jiyuu = readStr(buffer, 553, 6);
    uma.Ikisaki = readStr(buffer, 559, 10);
    uma.DataSakuseiNengappi = dataSakuseiNengappi;
    this.entityManager.persist(uma);
  }
}
