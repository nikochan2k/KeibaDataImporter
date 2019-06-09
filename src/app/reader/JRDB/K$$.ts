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
    const kishu = await this.saveKishu(buffer);
    await this.saveKishuComment(buffer, kishu);
  }

  public async saveKishu(buffer: Buffer) {
    const kishu = new Kishu();
    kishu.JrdbKishuCode = readInt(buffer, 0, 5);
    const kishuMei = readStr(buffer, 14, 12);
    const furigana = readStr(buffer, 26, 30);
    const tanshukuKishuMei = readStr(buffer, 56, 6);
    kishu.Seinengappi = readPositiveInt(buffer, 67, 8);
    kishu.MenkyoKoufuNengappi = readPositiveInt(buffer, 75, 4);
    return await this.kishuDao.saveKishu(kishu, kishuMei, tanshukuKishuMei, furigana);
  }

  public async saveKishuComment(buffer: Buffer, kishu: Kishu) {
    const commentNyuuryokuNengappi = readInt(buffer, 125, 8);
    if (commentNyuuryokuNengappi === null) {
      return;
    }
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
    toBe.KishuId = kishu.Id;
    toBe.Comment = readStr(buffer, 85, 40);
    toBe.CommentNyuuryokuNengappi = commentNyuuryokuNengappi;
    await this.repository.save(toBe);
  }

}