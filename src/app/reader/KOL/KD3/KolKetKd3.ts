import { Inject, Service } from "typedi";
import { EntityManager } from "typeorm";
import { OrmManager } from "typeorm-typedi-extensions";
import * as $U from "../../../converters/Uma";
import { UmaDao } from "../../../daos/UmaDao";
import { Uma } from "../../../entities/Uma";
import { DataToImport } from "../../DataToImport";
import { Tool } from "../../Tool";
import {
  readInt,
  readStr,
} from "../../Reader";

@Service()
export class KolKetKd3 extends DataToImport {

  @OrmManager()
  protected entityManager: EntityManager;

  @Inject()
  private tool: Tool;

  @Inject()
  private umaDao: UmaDao;

  protected getBufferLength() {
    return 2010;
  }

  protected async saveSosenba1(buffer: Buffer, offset: number, seibetsu: $U.Seibetsu, chichiUmaId?: number, hahaUmaId?: number) {
    const bamei = readStr(buffer, offset + 8, 34);
    if (!bamei) {
      return null;
    }

    const uma = new Uma();
    uma.Seibetsu = seibetsu;
    uma.YunyuubaFlag = $U.yunyuubaFlag.toCodeFromKol(buffer, offset, 1);
    uma.KolUmaCode = readInt(buffer, offset + 1, 7);
    if (this.tool.isEnglish(bamei)) {
      uma.EigoBamei = bamei;
    } else {
      uma.KanaBamei = bamei;
    }
    uma.EigoBamei = readStr(buffer, offset + 42, 34);
    uma.Seinen = readInt(buffer, offset + 76, 4);
    uma.Keiro = $U.keiro.toCodeFromKol(buffer, offset + 80, 2);
    uma.Kesshu = $U.keiro.toCodeFromKol(buffer, offset + 82, 2);
    uma.ChichiUmaId = chichiUmaId;
    uma.HahaUmaId = hahaUmaId;

    return this.umaDao.saveUma(uma);
  }

  protected async saveSosenba23(buffer: Buffer, offset: number, seibetsu: $U.Seibetsu, chichiUmaId?: number, hahaUmaId?: number) {
    const bamei = readStr(buffer, offset + 8, 34);
    if (!bamei) {
      return null;
    }

    const uma = new Uma();
    uma.Seibetsu = seibetsu;
    uma.YunyuubaFlag = $U.yunyuubaFlag.toCodeFromKol(buffer, offset, 1);
    uma.KolUmaCode = readInt(buffer, offset + 1, 7);
    if (this.tool.isEnglish(bamei)) {
      uma.EigoBamei = bamei;
    } else {
      uma.KanaBamei = bamei;
    }
    uma.ChichiUmaId = chichiUmaId;
    uma.HahaUmaId = hahaUmaId;

    return this.umaDao.saveUma(uma);
  }

  public async save(buffer: Buffer) {
    const hhh = await this.saveSosenba23(buffer, 667, $U.Seibetsu.Hinba);
    const hhc = await this.saveSosenba23(buffer, 625, $U.Seibetsu.Boba);
    const hh = await this.saveSosenba23(buffer, 332, $U.Seibetsu.Hinba, hhc.Id, hhh.Id);

    const hch = await this.saveSosenba23(buffer, 583, $U.Seibetsu.Hinba);
    const hcc = await this.saveSosenba23(buffer, 542, $U.Seibetsu.Boba);
    const hc = await this.saveSosenba23(buffer, 289, $U.Seibetsu.Boba, hcc.Id, hch.Id);

    const chh = await this.saveSosenba23(buffer, 499, $U.Seibetsu.Hinba);
    const chc = await this.saveSosenba23(buffer, 457, $U.Seibetsu.Boba);
    const ch = await this.saveSosenba23(buffer, 247, $U.Seibetsu.Hinba, chc.Id, chh.Id);

    const cch = await this.saveSosenba23(buffer, 415, $U.Seibetsu.Hinba);
    const ccc = await this.saveSosenba23(buffer, 373, $U.Seibetsu.Boba);
    const cc = await this.saveSosenba23(buffer, 205, $U.Seibetsu.Hinba, ccc.Id, cch.Id);

    const h = await this.saveSosenba1(buffer, 121, $U.Seibetsu.Hinba, hc.Id, hh.Id);
    const c = await this.saveSosenba1(buffer, 37, $U.Seibetsu.Boba, cc.Id, ch.Id);

    const uma = new Uma();
    uma.KolUmaCode = readInt(buffer, 0, 7);
    const bamei = readStr(buffer, 7, 30);
    if (this.tool.isEnglish(bamei)) {
      uma.EigoBamei = bamei;
    } else {
      uma.KanaBamei = bamei;
    }
    uma.ChichiUmaId = c.Id;
    uma.HahaUmaId = h.Id;
    await this.umaDao.saveUma(uma);
  }

}