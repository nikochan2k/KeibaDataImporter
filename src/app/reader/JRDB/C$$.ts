import { Inject } from "typedi";
import { Repository } from "typeorm";
import { OrmRepository } from "typeorm-typedi-extensions";
import * as $C from "../../converters/Common";
import { ChoukyoushiDao } from "../../daos/ChoukyoushiDao";
import { Choukyoushi } from "../../entities/Choukyoushi";
import { ChoukyoushiComment } from "../../entities/ChoukyoushiComment";
import { Bridge } from "../Bridge";
import { DataToImport } from "../DataToImport";
import { readInt, readPositiveInt, readStr } from "../Reader";

export abstract class C$$ extends DataToImport {

  @Inject()
  private choukyoushiDao: ChoukyoushiDao;

  @OrmRepository(ChoukyoushiComment)
  private repository: Repository<ChoukyoushiComment>;

  public async save(buffer: Buffer, bridge: Bridge) {
    const toBe = new Choukyoushi();
    toBe.JrdbChoukyoushiCode = readInt(buffer, 0, 5);
    toBe.TourokuMasshouFlag = $C.masshouFlag.toCodeFromJrdb(buffer, 5, 1);
    toBe.TourokuMasshouNengappi = readInt(buffer, 6, 8);
    const choukyoushiMei = readStr(buffer, 14, 12);
    const furigana = readStr(buffer, 26, 30);
    const tanshuku = readStr(buffer, 56, 6);
    toBe.TouzaiBetsu = $C.touzaiBetsu.toCodeFromJrdb(buffer, 62, 1);
    toBe.ShozokuBasho = $C.basho.toCodeFromJrdb(buffer, 63, 4);
    if (!toBe.ShozokuBasho) {
      toBe.ShozokuBashoMei = readStr(buffer, 63, 4);
    }
    toBe.Seinengappi = readPositiveInt(buffer, 67, 8);
    toBe.HatsuMenkyoNen = readPositiveInt(buffer, 75, 4);
    const choukyoushi = await this.choukyoushiDao.saveChoukyoushi(toBe, choukyoushiMei, tanshuku, furigana);
    await this.saveChoukyoushiComment(buffer, choukyoushi);
  }

  public async saveChoukyoushiComment(buffer: Buffer, choukyoushi: Choukyoushi) {
    const commentNyuuryokuNengappi = readInt(buffer, 119, 8);
    const asIs = await this.repository
      .createQueryBuilder("cc")
      .where("cc.ChoukyoushiId = :choukyoushiId")
      .setParameter("ChoukyoushiId", choukyoushi.Id)
      .where("cc.CommentNyuuryokuNengappi = :commentNyuuryokuNengappi")
      .setParameter("commentNyuuryokuNengappi", commentNyuuryokuNengappi)
      .getOne();
    if (asIs) {
      return;
    }
    const toBe = new ChoukyoushiComment();
    toBe.Comment = readStr(buffer, 79, 40);
    toBe.CommentNyuuryokuNengappi = commentNyuuryokuNengappi;
    await this.repository.save(toBe);
  }

}