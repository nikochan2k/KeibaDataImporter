import { Inject, Service } from "typedi";
import { EntityManager } from "typeorm";
import { OrmManager } from "typeorm-typedi-extensions";
import * as $CK from "../../../converters/Choukyoushi";
import * as $C from "../../../converters/Common";
import { ChoukyoushiDao } from "../../../daos/ChoukyoushiDao";
import { Choukyoushi } from "../../../entities/Choukyoushi";
import { DataToImport } from "../../DataToImport";
import {
  readInt,
  readStr,
} from "../../Reader";

@Service()
export class KolKyuKd3 extends DataToImport {

  @OrmManager()
  protected entityManager: EntityManager;

  @Inject()
  private choukyoushiDao: ChoukyoushiDao;

  protected getBufferLength() {
    return 1248;
  }

  public async save(buffer: Buffer) {
    const choukyoushi = new Choukyoushi();
    choukyoushi.KolKyuushaCode = readInt(buffer, 0, 5);
    choukyoushi.Seinengappi = readInt(buffer, 93, 8);
    choukyoushi.HatsuMenkyoNen = readInt(buffer, 101, 4);
    choukyoushi.TouzaiBetsu = $C.touzaiBetsu.toCodeFromKol(buffer, 105, 1);
    choukyoushi.ShozokuBasho = $C.basho.toCodeFromKol(buffer, 106, 2);
    choukyoushi.RitsuHokuNanBetsu = $CK.ritsuHokuNanBetsu.toCodeFromKol(buffer, 108, 1);
    choukyoushi.TourokuMasshouFlag = $C.masshouFlag.toCodeFromKol(buffer, 109, 1);
    const choukyoushiMei = readStr(buffer, 5, 32);
    const tanshuku = readStr(buffer, 37, 8);
    const furigana = readStr(buffer, 45, 48);
    await this.choukyoushiDao.saveChoukyoushi(choukyoushi, choukyoushiMei, tanshuku, furigana);
  }

}