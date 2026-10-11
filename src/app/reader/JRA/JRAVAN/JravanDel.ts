import { Inject, Service } from "typedi";
import { MasshouFlag } from "../../../converters/Common";
import { UmaDao } from "../../../daos/UmaDao";
import { Choukyoushi } from "../../../entities/Choukyoushi";
import { Kishu } from "../../../entities/Kishu";
import { Uma } from "../../../entities/Uma";
import { DataToImport } from "../../DataToImport";
import { readPositiveInt, readStr } from "../../Reader";
import { Tool } from "../../Tool";
import { JraTool } from "../JraTool";

/** 抹消競走馬 (JracDelu.dat) */
@Service()
export class JravanDelu extends DataToImport {
  @Inject()
  private jraTool: JraTool;

  @Inject()
  private umaDao: UmaDao;

  protected getBufferLength() {
    return 38;
  }

  public async save(buffer: Buffer) {
    const touroku = this.jraTool.readTouroku(buffer, 0);
    const bamei = readStr(buffer, 10, 18);
    if (!touroku && !bamei) {
      return;
    }
    const uma = new Uma();
    if (touroku) {
      uma.KettouTourokuBangou = touroku.bangou;
      uma.Seinen = touroku.seinen;
    }
    this.jraTool.setBamei(uma, bamei);
    uma.MasshouFlag = MasshouFlag.Massou;
    uma.MasshouNengappi = readPositiveInt(buffer, 28, 8);
    await this.umaDao.saveUma(uma);
  }
}

/** 抹消騎手 (JracDelk.dat) */
@Service()
export class JravanDelk extends DataToImport {
  @Inject()
  private tool: Tool;

  protected getBufferLength() {
    return 15;
  }

  public async save(buffer: Buffer) {
    const code = readStr(buffer, 0, 5);
    if (!code || !/^\d{5}$/.test(code)) {
      return;
    }
    const kishu = new Kishu();
    kishu.JvDataKishuCode = code;
    kishu.MenkyoMasshouNengappi = readPositiveInt(buffer, 5, 8);
    const asIs = await this.entityManager.findOneBy(Kishu, { JvDataKishuCode: code });
    await this.tool.saveOrUpdate(Kishu, asIs, kishu);
  }
}

/** 抹消調教師 (JracDelc.dat) */
@Service()
export class JravanDelc extends DataToImport {
  @Inject()
  private tool: Tool;

  protected getBufferLength() {
    return 15;
  }

  public async save(buffer: Buffer) {
    const code = readStr(buffer, 0, 5);
    if (!code || !/^\d{5}$/.test(code)) {
      return;
    }
    const choukyoushi = new Choukyoushi();
    choukyoushi.JvDataChoukyoushiCode = code;
    choukyoushi.MenkyoMasshouNengappi = readPositiveInt(buffer, 5, 8);
    const asIs = await this.entityManager.findOneBy(Choukyoushi, { JvDataChoukyoushiCode: code });
    await this.tool.saveOrUpdate(Choukyoushi, asIs, choukyoushi);
  }
}
