import { MasshouFlag } from "../../../converters/Common";
import { umaDao } from "../../../daos/UmaDao";
import { findOneBy } from "../../../db/helpers";
import { Choukyoushi } from "../../../entities/Choukyoushi";
import { Kishu } from "../../../entities/Kishu";
import { Uma } from "../../../entities/Uma";
import { DataToImport } from "../../DataToImport";
import { readPositiveInt, readStr } from "../../Reader";
import { tool } from "../../Tool";
import { jraTool } from "../JraTool";

/** 抹消競走馬 (JracDelu.dat) */
export class JravanDelu extends DataToImport {
  protected getBufferLength() {
    return 38;
  }

  public async save(buffer: Buffer) {
    const touroku = jraTool.readTouroku(buffer, 0);
    const bamei = readStr(buffer, 10, 18);
    if (!touroku && !bamei) {
      return;
    }
    const uma = {} as Uma;
    if (touroku) {
      uma.KettouTourokuBangou = touroku.bangou;
      uma.Seinen = touroku.seinen;
    }
    jraTool.setBamei(uma, bamei);
    uma.MasshouFlag = MasshouFlag.Massou;
    uma.MasshouNengappi = readPositiveInt(buffer, 28, 8);
    await umaDao.saveUma(uma);
  }
}

/** 抹消騎手 (JracDelk.dat) */
export class JravanDelk extends DataToImport {
  protected getBufferLength() {
    return 15;
  }

  public async save(buffer: Buffer) {
    const code = readStr(buffer, 0, 5);
    if (!code || !/^\d{5}$/.test(code)) {
      return;
    }
    const kishu = {} as Kishu;
    kishu.JvDataKishuCode = code;
    kishu.MenkyoMasshouNengappi = readPositiveInt(buffer, 5, 8);
    const asIs = await findOneBy(Kishu, { JvDataKishuCode: code });
    await tool.saveOrUpdate(Kishu, asIs, kishu);
  }
}

/** 抹消調教師 (JracDelc.dat) */
export class JravanDelc extends DataToImport {
  protected getBufferLength() {
    return 15;
  }

  public async save(buffer: Buffer) {
    const code = readStr(buffer, 0, 5);
    if (!code || !/^\d{5}$/.test(code)) {
      return;
    }
    const choukyoushi = {} as Choukyoushi;
    choukyoushi.JvDataChoukyoushiCode = code;
    choukyoushi.MenkyoMasshouNengappi = readPositiveInt(buffer, 5, 8);
    const asIs = await findOneBy(Choukyoushi, { JvDataChoukyoushiCode: code });
    await tool.saveOrUpdate(Choukyoushi, asIs, choukyoushi);
  }
}
