import { EntityManager } from "typeorm";
import * as $C from "../../converters/Common";
import * as $U from "../../converters/Uma";
import { umaDao } from "../../daos/UmaDao";
import { Uma } from "../../entities/Uma";
import { OrmManager } from "../../OrmManager";
import { DataToImport } from "../DataToImport";
import { readInt, readPositiveInt, readStr } from "../Reader";
import { tool } from "../Tool";
import { kolUmaTool } from "./KolUmaTool";

export class KolShu extends DataToImport {
  @OrmManager()
  protected entityManager: EntityManager;

  protected getBufferLength() {
    return 2010;
  }

  public async save(buffer: Buffer) {
    const uma = new Uma();
    uma.KolUmaCode = readInt(buffer, 0, 7);
    const bamei = readStr(buffer, 7, 34);
    if (tool.isEnglish(bamei)) {
      uma.EigoBamei = bamei;
    } else {
      uma.KanaBamei = bamei;
    }
    uma.Seinen = readPositiveInt(buffer, 41, 4);
    uma.Keiro = $U.keiro.toCodeFromKol(buffer, 45, 2);
    uma.Sanchi = $U.sanch.toCodeFromKol(buffer, 47, 3);
    uma.YunyuubaFlag = $U.yunyuubaFlag.toCodeFromKol(buffer, 50, 1);
    uma.Seibetsu = $U.Seibetsu.Boba;
    const chichiUma = await kolUmaTool.saveOyaUma(buffer, 51, $U.Seibetsu.Boba);
    uma.ChichiUmaId = chichiUma?.Id;
    const hahaUma = await kolUmaTool.saveOyaUma(buffer, 92, $U.Seibetsu.Hinba);
    uma.HahaUmaId = hahaUma?.Id;
    uma.KyoriTekisei = $U.kyoriTekisei.toCodeFromKol(buffer, 133, 1);
    uma.OmoKousetsu = $C.hyouka.toCodeFromKol(buffer, 134, 1);
    uma.DirtKousetsu = $C.hyouka.toCodeFromKol(buffer, 135, 1);
    uma.ShibouNen = readPositiveInt(buffer, 136, 4);
    await umaDao.saveUma(uma);
  }
}
