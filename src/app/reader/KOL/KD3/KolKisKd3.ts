import { Inject, Service } from "typedi";
import { EntityManager } from "typeorm";
import { OrmManager } from "typeorm-typedi-extensions";
import * as $C from "../../../converters/Common";
import * as $K from "../../../converters/Kishu";
import { KishuDao } from "../../../daos/KishuDao";
import { Kishu } from "../../../entities/Kishu";
import { KishuRireki } from "../../../entities/KishuRireki";
import { DataToImport } from "../../DataToImport";
import {
  readInt,
  readStr,
} from "../../Reader";

@Service()
export class KolKisKd3 extends DataToImport {

  @OrmManager()
  protected entityManager: EntityManager;

  @Inject()
  private kishuDao: KishuDao;

  protected getBufferLength() {
    return 1729;
  }

  public async save(buffer: Buffer) {
    let kishu = new Kishu();
    kishu.KolKishuCode = readInt(buffer, 0, 5);
    kishu.Seinengappi = readInt(buffer, 93, 8);
    kishu.HatsuMenkyoNen = readInt(buffer, 101, 4);
    const kishuMei = readStr(buffer, 5, 32);
    const tanshukuKishuMei = readStr(buffer, 37, 8);
    const furigana = readStr(buffer, 45, 48);
    kishu = await this.kishuDao.saveKishu(kishu, kishuMei, tanshukuKishuMei, furigana);

    const kishuRireki = new KishuRireki();
    kishuRireki.KishuId = kishu.Id;
    kishuRireki.KishuTouzaiBetsu = $C.touzaiBetsu.toCodeFromKol(buffer, 105, 1);
    kishuRireki.KishuShozokuBasho = $C.basho.toCodeFromKol(buffer, 106, 2);
    kishuRireki.KijouShikakuKubun = $K.kijouShikakuKubun.toCodeFromKol(buffer, 108, 1);
    kishuRireki.MinaraiKubun = $K.minaraiKubun.toCodeFromKol(buffer, 109, 1);
    kishuRireki.TourokuMasshouFlag = $C.masshouFlag.toCodeFromKol(buffer, 158, 1);
    await this.kishuDao.saveKishuRireki(kishuRireki);
  }

}