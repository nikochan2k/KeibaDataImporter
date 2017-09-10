import { Inject } from "typedi";
import { Repository } from "typeorm";
import { OrmRepository } from "typeorm-typedi-extensions";
import { KishuDao } from "../../daos/KishuDao";
import { Kishu } from "../../entities/Kishu";
import { KishuComment } from "../../entities/KishuComment";
import { Bridge } from "../Bridge";
import { DataToImport } from "../DataToImport";
import { readInt, readPositiveInt, readStr } from "../Reader";

export abstract class K$$ extends DataToImport {

  @Inject()
  private kishuDao: KishuDao;

  @OrmRepository(KishuComment)
  private repository: Repository<KishuComment>;

  public async save(buffer: Buffer, bridge: Bridge) {
    const toBe = new Kishu();
    toBe.JrdbKishuCode = readInt(buffer, 0, 5);
    toBe.KishuMei = readStr(buffer, 14, 12);
    toBe.Furigana = readStr(buffer, 26, 30);
    toBe.TanshukuKishuMei = readStr(buffer, 56, 6);
    toBe.Seinengappi = readPositiveInt(buffer, 67, 8);
    toBe.HatsuMenkyoNen = readPositiveInt(buffer, 75, 4);
    const kyuusha = await this.kishuDao.saveKishu(toBe);
    await this.saveKishuComment(buffer, kyuusha);
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