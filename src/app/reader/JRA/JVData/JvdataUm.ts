import { Inject, Injectable } from "@nestjs/common";
import * as $C from "../../../converters/Common";
import * as $U from "../../../converters/Uma";
import { SeisanshaDao } from "../../../daos/SeisanshaDao";
import { UmaDao } from "../../../daos/UmaDao";
import { Kyousouba } from "../../../entities/Kyousouba";
import { MeishouKubun } from "../../../entities/Shoyuu";
import { Uma } from "../../../entities/Uma";
import { readPositiveInt, readStr } from "../../Reader";
import { Tool } from "../../Tool";
import { JraTool } from "../JraTool";
import { JvdataRecord } from "./JvdataRecord";

/** 3 代血統情報の並び (父・母・父父・父母・母父・母母・父父父・父父母・父母父・父母母・母父父・母父母・母母父・母母母) の親の位置 */
const parentsOf: { [index: number]: [number, number] } = {
  0: [2, 3],
  1: [4, 5],
  2: [6, 7],
  3: [8, 9],
  4: [10, 11],
  5: [12, 13],
};

/**
 * 競走馬マスタ (UM)。
 * 馬主、賞金や着回数の累計、脚質傾向、繁殖登録番号は取り込まない
 * (馬主は出走馬ごと、レースの成績は馬毎レース情報から取り込む)。
 */
@Injectable()
export class JvdataUm extends JvdataRecord {
  public readonly id = "UM";
  public readonly length = 1609;

  @Inject()
  private tool: Tool;

  @Inject()
  private jraTool: JraTool;

  @Inject()
  private umaDao: UmaDao;

  @Inject()
  private seisanshaDao: SeisanshaDao;

  public async save(buffer: Buffer) {
    if (this.getKubun(buffer) === "0") {
      return;
    }
    const touroku = this.jraTool.readTouroku(buffer, 11);
    const bamei = readStr(buffer, 46, 36);
    if (!touroku && !bamei) {
      return;
    }
    const seibetsu = $U.seibetsu.toCodeFromJvData(buffer, 200, 1);

    // 3 代血統は、馬名だけがある。末端から親をたどる
    const pedigree: Uma[] = [];
    for (let i = 13; 0 <= i; i--) {
      const oya = parentsOf[i];
      const isSire = i % 2 === 0;
      pedigree[i] = await this.saveOyaUma(
        readStr(buffer, 204 + i * 46 + 10, 36),
        isSire ? $U.Seibetsu.Boba : $U.Seibetsu.Hinba,
        oya ? pedigree[oya[0]] : undefined,
        oya ? pedigree[oya[1]] : undefined,
      );
    }

    let uma = new Uma();
    if (touroku) {
      uma.KettouTourokuBangou = touroku.bangou;
    }
    this.jraTool.setBamei(uma, bamei);
    uma.EigoBamei = uma.EigoBamei ?? readStr(buffer, 118, 60) ?? undefined;
    uma.Seinengappi = readPositiveInt(buffer, 38, 8);
    uma.Seinen = uma.Seinengappi ? Math.floor(uma.Seinengappi / 10000) : touroku?.seinen;
    uma.Kesshu = $U.kesshu.toCodeFromJvData(buffer, 201, 1);
    uma.Seibetsu = seibetsu;
    uma.Keiro = $U.keiro.toCodeFromJvData(buffer, 202, 2);
    uma.ChichiUmaId = pedigree[0]?.Id;
    uma.HahaUmaId = pedigree[1]?.Id;
    uma.SanchiMei = readStr(buffer, 962, 20);
    uma.MasshouFlag =
      readStr(buffer, 21, 1) === "1" ? $C.MasshouFlag.Massou : $C.MasshouFlag.Geneki;
    uma.MasshouNengappi = readPositiveInt(buffer, 30, 8);
    uma = await this.umaDao.saveUma(uma);

    const seisanshaMei = this.tool.normalizeHoujinMei(buffer, 890, 72);
    if (seisanshaMei) {
      await this.seisanshaDao.save(uma.Id, MeishouKubun.Full, seisanshaMei);
    }

    const choukyoushi = await this.jraTool.saveChoukyoushi(buffer, 849, 854);
    let kyousouba = new Kyousouba();
    kyousouba.UmaId = uma.Id;
    kyousouba.Seibetsu = seibetsu;
    kyousouba.UmaKigou = $U.umaKigou.toCodeFromJvData(buffer, 198, 2);
    kyousouba.ChoukyoushiId = choukyoushi?.Id;
    kyousouba = await this.umaDao.saveKyousouba(kyousouba);
  }

  private async saveOyaUma(
    bamei: string | null,
    seibetsu: $U.Seibetsu,
    chichiUma?: Uma,
    hahaUma?: Uma,
  ) {
    if (!bamei) {
      return undefined;
    }
    const uma = new Uma();
    this.jraTool.setBamei(uma, bamei);
    uma.Seibetsu = seibetsu;
    uma.ChichiUmaId = chichiUma?.Id;
    uma.HahaUmaId = hahaUma?.Id;
    return this.umaDao.saveUma(uma);
  }
}
