import "reflect-metadata";
import { Inject, Service } from "typedi";
import { EntityManager } from "typeorm";
import { OrmEntityManager } from "typeorm-typedi-extensions";
import * as $C from "../../../converters/Common";
import * as $R from "../../../converters/Race";
import * as $S from "../../../converters/Shussouba";
import * as $U from "../../../converters/Uma";
import { UmaDao } from "../../../daos/UmaDao";
import { Race } from "../../../entities/Race";
import { RaceClass } from "../../../entities/RaceClass";
import { Shussouba } from "../../../entities/Shussouba";
import { Uma } from "../../../entities/Uma";
import { DataToImport } from "../../DataToImport";
import { DataTool } from "../../DataTool";
import {
  readDate,
  readDouble,
  readInt,
  readPositiveInt,
  readStr,
  readStrWithNoSpace,
  readTime
} from "../../Reader";
import { KolChoukyouTool } from "../KolChoukyouTool";
import { KolTool } from "../KolTool";


@Service()
export class KolUmaKd3 extends DataToImport {

  @OrmEntityManager()
  private entityManager: EntityManager;

  @Inject()
  private tool: DataTool;

  @Inject()
  private kolTool: KolTool;

  @Inject()
  private choukyouTool: KolChoukyouTool;

  @Inject()
  private umaDao: UmaDao;

  protected getBufferLength() {
    return 5166;
  }

  protected async saveOyaUma(buffer: Buffer, offset: number, seibetsu: $U.Seibetsu, chichiOffset?: number, hahaOffset?: number) {
    let uma = new Uma();
    uma.Bamei = readStr(buffer, offset, 34);
    uma = await this.umaDao.saveUma(uma);

    let needPersist = !uma.Id;
    if (chichiOffset && !uma.ChichiUma) {
      uma.ChichiUma = await this.saveOyaUma(buffer, chichiOffset, $U.Seibetsu.Boba);
      needPersist = true;
    }
    if (hahaOffset && !uma.HahaUma) {
      uma.HahaUma = await this.saveOyaUma(buffer, hahaOffset, $U.Seibetsu.Hinba);
      needPersist = true;
    }

    if (needPersist) {
      uma.Seibetsu = seibetsu;
      uma = await this.entityManager.persist(uma);
    }

    return uma;
  }

  protected async save(buffer: Buffer) {
    const kyousouba = await this.saveUma(buffer);
    [1064, 1654, 2244, 2834, 3424].forEach(async (offset) => {
      const raceBuffer = buffer.slice(offset, offset + 151);
      const race = await this.saveRace(raceBuffer);
      if (race) {
        const shussoubaBuffer = buffer.slice(offset + 151, offset + 590);
        const shussouba = await this.saveShussouba(shussoubaBuffer, race, kyousouba);
        await this.kolTool.saveShussoubaTsuukaJuni(shussoubaBuffer, 239, shussouba);
        await this.choukyouTool.saveChoukyou(shussoubaBuffer, 248, shussouba, 1);
      }
    });
  }

  protected async saveUma(buffer: Buffer) {
    const kyousouba = new Uma();
    kyousouba.Bamei = readStr(buffer, 7, 30);
    kyousouba.KyuuBamei = readStr(buffer, 37, 40);
    kyousouba.Seinengappi = readDate(buffer, 77, 8);
    kyousouba.Keiro = $U.keiro.toCodeFromKol(buffer, 85, 2);
    kyousouba.Kesshu = $U.kesshu.toCodeFromKol(buffer, 87, 2);
    kyousouba.Sanchi = $U.sanch.toCodeFromKol(buffer, 89, 3);
    kyousouba.UmaKigou = $U.umaKigou.toCodeFromKol(buffer, 92, 2);
    kyousouba.Seibetsu = $U.seibetsu.toCodeFromKol(buffer, 94, 1);
    kyousouba.ChichiUma = await this.saveOyaUma(buffer, 104, $U.Seibetsu.Boba);
    kyousouba.HahaUma = await this.saveOyaUma(buffer, 145, $U.Seibetsu.Hinba, 186, 227);
    kyousouba.Banushi = await this.kolTool.saveBanushi(buffer, 343);
    kyousouba.Seisansha = await this.kolTool.saveSeisansha(buffer, 423);
    kyousouba.Kyuusha = await this.kolTool.saveKyuusha(buffer, 488);
    kyousouba.KoueiGaikokuKyuushaMei = readStr(buffer, 536, 8);
    kyousouba.MasshouFlag = $U.masshouFlag.toCodeFromKol(buffer, 544, 1);
    kyousouba.MasshouNengappi = readDate(buffer, 545, 8);
    kyousouba.Jiyuu = readStr(buffer, 553, 6);
    kyousouba.Ikisaki = readStr(buffer, 559, 10);
    return await this.umaDao.saveUma(kyousouba);
  }

  protected async saveRace(buffer: Buffer) {
    const id = this.kolTool.getRaceId(buffer);
    if (!id) {
      return null;
    }
    let race = await this.entityManager.findOneById(Race, id);
    if (race) {
      return race;
    }
    race = new Race();
    race.Id = id;
    race.Basho = $C.basho.toCodeFromKol(buffer, 0, 2);
    race.Nen = readPositiveInt(buffer, 2, 4);
    race.Kaiji = readPositiveInt(buffer, 6, 2);
    race.Nichiji = readPositiveInt(buffer, 8, 2);
    race.RaceBangou = readPositiveInt(buffer, 10, 2);
    race.Nengappi = readDate(buffer, 12, 8);
    race.Kyuujitsu = $R.kyuujitsu.toCodeFromKol(buffer, 20, 1);
    race.Youbi = $R.youbi.toCodeFromKol(buffer, 21, 1);
    const raceClass = await this.saveRaceClass(buffer);
    race.RaceClass = raceClass;
    race.JuushouKaisuu = readPositiveInt(buffer, 26, 3);
    race.DirtShiba = $R.dirtShiba.toCodeFromKol(buffer, 115, 1);
    race.MigiHidari = $R.migiHidari.toCodeFromKol(buffer, 116, 1);
    race.UchiSoto = $R.uchiSoto.toCodeFromKol(buffer, 117, 1);
    race.Course = $R.course.toCodeFromKol(buffer, 118, 1);
    race.Kyori = readPositiveInt(buffer, 119, 4);
    race.Tousuu = readPositiveInt(buffer, 123, 2);
    race.TorikeshiTousuu = readInt(buffer, 125, 2);
    race.Pace = $R.pace.toCodeFromKol(buffer, 127, 1);
    race.Tenki = $R.tenki.toCodeFromKol(buffer, 128, 1);
    race.Baba = $R.baba.toCodeFromKol(buffer, 129, 1);
    race.Seed = $R.seed.toCodeFromKol(buffer, 130, 1);
    race.GaikokuKeibajouMei = readStr(buffer, 131, 20);
    return await this.entityManager.persist(race);
  }

  protected async saveRaceClass(buffer: Buffer) {
    const rc = new RaceClass();
    rc.KouryuuFlag = $R.kouryuuFlag.toCodeFromKol(buffer, 22, 1);
    rc.ChuuouChihouGaikoku = $R.chuuouChihouGaikoku.toCodeFromKol(buffer, 23, 1);
    rc.IppanTokubetsu = $R.ippanTokubetsu.toCodeFromKol(buffer, 24, 1);
    rc.HeichiShougai = $R.heichiShougai.toCodeFromKol(buffer, 25, 1);
    rc.TokubetsuMei = this.tool.normalizeTokubetsuMei(buffer, 29, 30);
    rc.TanshukuTokubetsuMei = readStrWithNoSpace(buffer, 59, 14);
    rc.Grade = $R.grade.toCodeFromKol(buffer, 73, 1);
    rc.BetteiBareiHandi = $R.betteiBareiHandi.toCodeFromKol(buffer, 74, 2);
    rc.BetteiBareiHandiShousai = readStr(buffer, 76, 18);
    const joukenFuka1 = $R.joukenFuka1.toCodesFromKol(buffer, 94, 2);
    const joukenFuka2 = $R.joukenFuka2.toCodesFromKol(buffer, 96, 2);
    rc.JoukenFuka = this.tool.getJoukenFuka(joukenFuka1, joukenFuka2);
    rc.JoukenKei = $R.JoukenKei.toCodeFromKol(buffer, 98, 1);
    rc.JoukenNenreiSeigen = $R.joukenNenreiSeigen.toCodeFromKol(buffer, 99, 1);
    rc.Jouken1 = $R.jouken.toCodeFromKol(buffer, 100, 5);
    if (rc.ChuuouChihouGaikoku !== 0) {
      rc.Kumi1 = readPositiveInt(buffer, 105, 2);
      rc.IjouIkaMiman = $R.ijouIkaMiman.toCodeFromKol(buffer, 107, 1);
      rc.Jouken2 = $R.jouken.toCodeFromKol(buffer, 108, 5);
      rc.Kumi2 = readPositiveInt(buffer, 113, 2);
    }
    const raceClass = await this.tool.saveRaceClass(rc);
    return raceClass;
  }

  protected async saveShussouba(buffer: Buffer, race: Race, kyousouba: Uma) {
    const umaban = readPositiveInt(buffer, 1, 2);
    let id: number;
    let shussouba: Shussouba;
    if (1 <= umaban && umaban <= 28) {
      id = race.Id * 100 + umaban;
      shussouba = await this.entityManager.findOneById(Shussouba, id);
    } else {
      id = race.Id * 100 + 28;
      do {
        id++; // 地方競馬で馬番がない場合 29から始まる
        shussouba = await this.entityManager.findOneById(Shussouba, id);
      } while (!shussouba || shussouba.Kyousouba.Id === kyousouba.Id);
    }
    if (shussouba) {
      return shussouba;
    }
    shussouba = new Shussouba();
    shussouba.Id = id;
    shussouba.Race = race;
    shussouba.Wakuban = readPositiveInt(buffer, 0, 1);
    shussouba.Umaban = umaban;
    shussouba.Gate = readPositiveInt(buffer, 3, 2);
    shussouba.Kyousouba = await this.saveKyousouba(buffer, kyousouba);
    shussouba.Nenrei = readPositiveInt(buffer, 8, 2);
    shussouba.Blinker = $S.blinker.toCodeFromKol(buffer, 90, 1);
    shussouba.Kinryou = readDouble(buffer, 91, 3, 0.1);
    shussouba.Bataijuu = readPositiveInt(buffer, 94, 3);
    shussouba.Zougen = readInt(buffer, 97, 3);
    shussouba.KolRecordShisuu = readInt(buffer, 100, 3);
    shussouba.Kishu = await this.kolTool.saveKishu(buffer, 103);
    shussouba.Norikawari = $S.norikawari.toCodeFromKol(buffer, 157, 1);
    shussouba.Kyuusha = await this.kolTool.saveKyuusha(buffer, 158);
    shussouba.KolYosou1 = $S.yosou.toCodeFromKol(buffer, 206, 1);
    shussouba.KolYosou2 = $S.yosou.toCodeFromKol(buffer, 207, 1);
    shussouba.Ninki = readPositiveInt(buffer, 208, 2);
    shussouba.Odds = readDouble(buffer, 210, 5, 0.1);
    shussouba.KakuteiChakujun = this.tool.getChakujun(buffer, 215, 2);
    shussouba.ChakujunFuka = $S.chakujunFuka.toCodeFromKol(buffer, 217, 2);
    shussouba.NyuusenChakujun = this.tool.getChakujun(buffer, 219, 2);
    shussouba.TorikeshiShubetsu = $S.torikeshiShubetsu.toCodeFromKol(buffer, 221, 1);
    shussouba.RecordNinshiki = $S.recordNinshiki.toCodeFromKol(buffer, 222, 1);
    shussouba.Time = readTime(buffer, 223, 4);
    shussouba.Chakusa1 = readInt(buffer, 227, 2);
    shussouba.Chakusa2 = $S.chakura2.toCodeFromKol(buffer, 229, 1);
    shussouba.TimeSa = this.kolTool.getTimeSa(buffer, 230);
    if (1200 <= shussouba.Race.Kyori) {
      shussouba.Ten3F = readDouble(buffer, 233, 3, 0.1);
      if (shussouba.Time && shussouba.Ten3F) {
        shussouba.Ten3FIkou = shussouba.Time - shussouba.Ten3F;
      }
    }
    shussouba.Agari3F = readDouble(buffer, 236, 3, 0.1);
    if (shussouba.Time && shussouba.Agari3F) {
      shussouba.Agari3FIzen = shussouba.Time - shussouba.Agari3F;
    }
    if (1200 < shussouba.Race.Kyori && shussouba.Ten3F && shussouba.Agari3F) {
      shussouba.Chuukan = shussouba.Time - shussouba.Ten3F - shussouba.Agari3F;
    }
    shussouba.YonCornerIchiDori = $S.yonCornerIchiDori.toCodeFromKol(buffer, 247, 1);
    return await this.entityManager.persist(shussouba);
  }

  public async saveKyousouba(buffer: Buffer, kyousouba: Uma) {
    const uma = new Uma();
    uma.Bamei = kyousouba.Bamei;
    uma.UmaKigou = $U.umaKigou.toCodeFromKol(buffer, 5, 2);
    uma.Seibetsu = $U.seibetsu.toCodeFromKol(buffer, 7, 1);
    uma.Banushi = await this.kolTool.saveBanushi(buffer, 10);
    return await this.umaDao.saveUma(uma);
  }

}
