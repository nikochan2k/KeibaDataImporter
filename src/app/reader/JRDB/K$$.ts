import { Inject } from "typedi";
import { Repository } from "typeorm";
import { OrmRepository } from "typeorm-typedi-extensions";
import * as $C from "../../converters/Common";
import * as $K from "../../converters/Kishu";
import { KishuDao } from "../../daos/KishuDao";
import { KyuushaDao } from "../../daos/KyuushaDao";
import { Kishu } from "../../entities/Kishu";
import { Kyuusha } from "../../entities/Kyuusha";
import { KishuRireki } from "../../entities/KishuRireki";
import { KishuComment } from "../../entities/KishuComment";
import { Bridge } from "../Bridge";
import { DataToImport } from "../DataToImport";
import { readInt, readPositiveInt, readStr } from "../Reader";

export abstract class K$$ extends DataToImport {

  @Inject()
  private kishuDao: KishuDao;

  @Inject()
  private kyuushaDao: KyuushaDao;

  @OrmRepository(KishuComment)
  private repository: Repository<KishuComment>;

  public async save(buffer: Buffer, bridge: Bridge) {
    const kishu = await this.saveKishu(buffer);
    await this.saveKishuRireki(buffer, kishu);
    await this.saveKishuComment(buffer, kishu);
  }

  public async saveKishu(buffer: Buffer) {
    const kishu = new Kishu();
    kishu.JrdbKishuCode = readInt(buffer, 0, 5);
    const kishuMei = readStr(buffer, 14, 12);
    const furigana = readStr(buffer, 26, 30);
    const tanshukuKishuMei = readStr(buffer, 56, 6);
    kishu.Seinengappi = readPositiveInt(buffer, 67, 8);
    kishu.HatsuMenkyoNen = readPositiveInt(buffer, 75, 4);
    return await this.kishuDao.saveKishu(kishu, kishuMei, tanshukuKishuMei, furigana);
  }

  public async saveKishuRireki(buffer: Buffer, kishu: Kishu) {
    const kishuRireki = new KishuRireki();
    kishuRireki.TourokuMasshouFlag = $C.masshouFlag.toCodeFromJrdb(buffer, 5, 1);
    kishuRireki.TourokuMasshouNengappi = readPositiveInt(buffer, 6, 8);
    kishuRireki.KishuTouzaiBetsu = $C.touzaiBetsu.toCodeFromJrdb(buffer, 62, 1);
    if (kishuRireki.KishuTouzaiBetsu === $C.TouzaiBetsu.Sonota) {
      kishuRireki.KishuShozokuBasho = $C.basho.toCodeFromJrdb(buffer, 63, 4);
    }
    kishuRireki.MinaraiKubun = $K.minaraiKubun.toCodeFromJrdb(buffer, 79, 1);

    const jrdbKyuushaCode = readInt(buffer, 80, 5);
    if (jrdbKyuushaCode) {
      let kyuusha = new Kyuusha();
      kyuusha.JrdbKyuushaCode = jrdbKyuushaCode;
      kyuusha = await this.kyuushaDao.saveKyuusha(kyuusha);
      if (kyuusha) {
        kishuRireki.KishuShozokuKyuushaId = kyuusha.Id;
      }
    }
  }

  public async saveKishuComment(buffer: Buffer, kishu: Kishu) {
    const commentNyuuryokuNengappi = readInt(buffer, 125, 8);
    const asIs = await this.repository
      .createQueryBuilder("kc")
      .where("kc.KishuId = :kishuId")
      .setParameter("kishuId", kishu.Id)
      .where("kc.CommentNyuuryokuNengappi = :commentNyuuryokuNengappi")
      .setParameter("commentNyuuryokuNengappi", commentNyuuryokuNengappi)
      .getOne();
    if (asIs) {
      return;
    }
    const toBe = new KishuComment();
    toBe.Comment = readStr(buffer, 85, 40);
    toBe.CommentNyuuryokuNengappi = commentNyuuryokuNengappi;
    await this.repository.save(toBe);
  }

}