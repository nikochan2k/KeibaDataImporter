import { Inject } from "typedi";
import { Repository } from "typeorm";
import { OrmRepository } from "typeorm-typedi-extensions";
import * as $C from "../../converters/Common";
import { KyuushaDao } from "../../daos/KyuushaDao";
import { Kyuusha } from "../../entities/Kyuusha";
import { KyuushaComment } from "../../entities/KyuushaComment";
import { Bridge } from "../Bridge";
import { DataToImport } from "../DataToImport";
import { readInt, readPositiveInt, readStr } from "../Reader";

export abstract class C$$ extends DataToImport {

  @Inject()
  private kyuushaDao: KyuushaDao;

  @OrmRepository(KyuushaComment)
  private repository: Repository<KyuushaComment>;

  public async save(buffer: Buffer, bridge: Bridge) {
    const toBe = new Kyuusha();
    toBe.JrdbKyuushaCode = readInt(buffer, 0, 5);
    toBe.TourokuMasshouFlag = $C.masshouFlag.toCodeFromJrdb(buffer, 5, 1);
    toBe.TourokuMasshouNengappi = readInt(buffer, 6, 8);
    const kyuushaMei = readStr(buffer, 14, 12);
    toBe.Furigana = readStr(buffer, 26, 30);
    const tanshukuKyuushaMei = readStr(buffer, 56, 6);
    toBe.TouzaiBetsu = $C.touzaiBetsu.toCodeFromJrdb(buffer, 62, 1);
    toBe.ShozokuBasho = $C.basho.toCodeFromJrdb(buffer, 63, 4);
    if (!toBe.ShozokuBasho) {
      toBe.ShozokuBashoMei = readStr(buffer, 63, 4);
    }
    toBe.Seinengappi = readPositiveInt(buffer, 67, 8);
    toBe.HatsuMenkyoNen = readPositiveInt(buffer, 75, 4);
    const kyuusha = await this.kyuushaDao.saveKyuusha(toBe, kyuushaMei, tanshukuKyuushaMei);
    await this.saveKyuushaComment(buffer, kyuusha);
  }

  public async saveKyuushaComment(buffer: Buffer, kyuusha: Kyuusha) {
    const commentNyuuryokuNengappi = readInt(buffer, 119, 8);
    const asIs = await this.repository
      .createQueryBuilder("kc")
      .where("kc.KyuushaId = :kyuushaId")
      .setParameter("kyuushaId", kyuusha.Id)
      .where("kc.CommentNyuuryokuNengappi = :commentNyuuryokuNengappi")
      .setParameter("commentNyuuryokuNengappi", commentNyuuryokuNengappi)
      .getOne();
    if (asIs) {
      return;
    }
    const toBe = new KyuushaComment();
    toBe.Comment = readStr(buffer, 79, 40);
    toBe.CommentNyuuryokuNengappi = commentNyuuryokuNengappi;
    await this.repository.save(toBe);
  }

}