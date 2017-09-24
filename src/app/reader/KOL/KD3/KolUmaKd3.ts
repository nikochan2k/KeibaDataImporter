import "reflect-metadata";
import { Inject, Service } from "typedi";
import * as $C from "../../../converters/Common";
import * as $K from "../../../converters/Kaisai";
import * as $R from "../../../converters/Race";
import * as $S from "../../../converters/Shussouba";
import * as $U from "../../../converters/Uma";
import { UmaDao } from "../../../daos/UmaDao";
import { Kaisai } from "../../../entities/Kaisai";
import { Kyousouba } from "../../../entities/Kyousouba";
import { Kyuusha } from "../../../entities/Kyuusha";
import { Choukyou } from "../../../entities/Choukyou";
import { Race } from "../../../entities/Race";
import { Shussouba } from "../../../entities/Shussouba";
import { ShussoubaYosou } from "../../../entities/ShussoubaYosou";
import { Uma } from "../../../entities/Uma";
import { DataToImport } from "../../DataToImport";
import {
  readDate,
  readDouble,
  readInt,
  readPositiveInt,
  readStr,
  readStrWithNoSpace,
  readTime
} from "../../Reader";
import { Tool } from "../../Tool";
import { KolChoukyouTool } from "../KolChoukyouTool";
import { KolRaceTool } from "../KolRaceTool";
import { KolTool } from "../KolTool";


@Service()
export class KolUmaKd3 extends DataToImport {

  private static readonly raceOffsets = [1064, 1654, 2244, 2834, 3424];

  @Inject()
  private tool: Tool;

  @Inject()
  private kolTool: KolTool;

  @Inject()
  private kolRaceTool: KolRaceTool;

  @Inject()
  private choukyouTool: KolChoukyouTool;

  @Inject()
  private umaDao: UmaDao;

  protected getBufferLength() {
    return 5166;
  }

  protected async saveOyaUma(buffer: Buffer, offset: number, seibetsu: $U.Seibetsu, chichiOffset?: number, hahaOffset?: number) {
    const bamei = readStr(buffer, offset, 34);
    if (!bamei) {
      return null;
    }
    const uma = new Uma();
    uma.Bamei = bamei;
    if (chichiOffset && !uma.ChichiUmaId) {
      const chichiUma = await this.saveOyaUma(buffer, chichiOffset, $U.Seibetsu.Boba);
      uma.ChichiUmaId = chichiUma && chichiUma.Id;
    }
    if (hahaOffset && !uma.HahaUmaId) {
      const hahaUma = await this.saveOyaUma(buffer, hahaOffset, $U.Seibetsu.Hinba);
      uma.HahaUmaId = hahaUma && hahaUma.Id;
    }
    uma.Seibetsu = seibetsu;

    return this.umaDao.saveUma(uma);
  }

  public async save(buffer: Buffer) {
    const result = await this.saveKyousouba(buffer);
    const kyousouba = result.Kyousouba;
    const uma = result.Uma;
    for (let i = 0; i < KolUmaKd3.raceOffsets.length; i++) {
      const offset = KolUmaKd3.raceOffsets[i];
      const raceBuffer = buffer.slice(offset, offset + 151);

      const kaisai = await this.saveKaisai(raceBuffer);
      if (!kaisai) {
        continue;
      }

      const race = await this.saveRace(raceBuffer, kaisai);
      if (!race) {
        continue;
      }
      const shussoubaBuffer = buffer.slice(offset + 151, offset + 590);
      const shussouba = await this.saveShussouba(shussoubaBuffer, race, kyousouba, uma);
      if (shussouba) {
        await this.saveShussoubaYosou(shussoubaBuffer, shussouba);
        await this.kolTool.saveShussoubaTsuukaJuni(shussoubaBuffer, 239, shussouba);
        const tanshukuKishuMei = readStrWithNoSpace(shussoubaBuffer, 140, 8);
        const choukyou = new Choukyou();
        choukyou.Id = shussouba.Id;
        await this.choukyouTool.saveChoukyou(choukyou);
        await this.choukyouTool.saveChoukyouRireki(shussoubaBuffer, 248, choukyou, tanshukuKishuMei, 1);
      }
    }
  }

  protected async saveKyousouba(buffer: Buffer) {
    const seibetsu = $U.seibetsu.toCodeFromKol(buffer, 94, 1);
    let uma = new Uma();
    uma.Bamei = readStr(buffer, 7, 30);
    uma.KyuuBamei = readStr(buffer, 37, 40);
    uma.Seinen = readPositiveInt(buffer, 77, 4);
    uma.Seinengappi = readDate(buffer, 77, 8);
    uma.Keiro = $U.keiro.toCodeFromKol(buffer, 85, 2);
    uma.Kesshu = $U.kesshu.toCodeFromKol(buffer, 87, 2);
    uma.Sanchi = $U.sanch.toCodeFromKol(buffer, 89, 3);
    uma.Seibetsu = seibetsu;
    const chichiUma = await this.saveOyaUma(buffer, 104, $U.Seibetsu.Boba);
    uma.ChichiUmaId = chichiUma && chichiUma.Id;
    const hahaUma = await this.saveOyaUma(buffer, 145, $U.Seibetsu.Hinba, 186, 227);
    uma.HahaUmaId = hahaUma && hahaUma.Id;
    const seisansha = await this.kolTool.saveSeisansha(buffer, 423);
    uma.SeisanshaId = seisansha && seisansha.Id;
    uma.MasshouFlag = $C.masshouFlag.toCodeFromKol(buffer, 544, 1);
    uma.MasshouNengappi = readDate(buffer, 545, 8);
    uma.Jiyuu = readStr(buffer, 553, 6);
    uma.Ikisaki = readStr(buffer, 559, 10);
    uma = await this.umaDao.saveUma(uma);
    let kyousouba = new Kyousouba();
    kyousouba.UmaId = uma.Id;
    kyousouba.Seibetsu = seibetsu;
    kyousouba.UmaKigou = $U.umaKigou.toCodeFromKol(buffer, 92, 2);
    const banushi = await this.kolTool.saveBanushi(buffer, 343);
    kyousouba.BanushiId = banushi && banushi.Id;
    const kyuusha = await this.kolTool.saveKyuusha(buffer, 488);
    kyousouba.KyuushaId = kyuusha && kyuusha.Id;
    kyousouba.KoueiGaikokuKyuushaMei = readStr(buffer, 536, 8);
    kyousouba = await this.umaDao.saveKyousouba(kyousouba);
    return { Kyousouba: kyousouba, Uma: uma };
  }

  protected async saveKaisai(buffer: Buffer) {
    const toBe = this.kolRaceTool.createKaisai(buffer);
    if (!toBe) {
      return null;
    }
    toBe.Kyuujitsu = $K.kyuujitsu.toCodeFromKol(buffer, 20, 1);
    toBe.Youbi = $K.youbi.toCodeFromKol(buffer, 21, 1);
    toBe.ChuuouChihouGaikoku = $K.chuuouChihouGaikoku.toCodeFromKol(buffer, 23, 1);
    toBe.GaikokuKeibajouMei = readStr(buffer, 131, 20);

    const asIs = await this.kolRaceTool.getKaisai(buffer);

    return await this.tool.update(Kaisai, asIs, toBe);
  }

  protected async saveRace(buffer: Buffer, kaisai: Kaisai) {
    const asIs = await this.kolRaceTool.getRace(buffer, kaisai.Id);
    if (asIs) {
      if (asIs.KolSeisekiSakuseiNengappi) {
        return asIs;
      } else if (!asIs.KolShutsubahyouSakuseiNengappi && !asIs.KolSeisekiSakuseiNengappi) {
        return asIs;
      }
    }

    const toBe = this.kolRaceTool.createRace(buffer);
    if (!toBe) {
      return null;
    }
    toBe.Nengappi = readDate(buffer, 12, 8);
    toBe.IppanTokubetsu = $R.ippanTokubetsu.toCodeFromKol(buffer, 24, 1);
    toBe.HeichiShougai = $R.heichiShougai.toCodeFromKol(buffer, 25, 1);
    toBe.JuushouKaisuu = readPositiveInt(buffer, 26, 3);
    toBe.TokubetsuMei = this.tool.normalizeTokubetsuMei(buffer, 29, 30);
    toBe.RaceMei = readStrWithNoSpace(buffer, 59, 14);
    toBe.Grade = $R.grade.toCodeFromKol(buffer, 73, 1);
    toBe.BetteiBareiHandi = $R.betteiBareiHandi.toCodeFromKol(buffer, 74, 2);
    const betteiBareiHandiShousai = readStr(buffer, 76, 18);
    if (toBe.BetteiBareiHandi === null) {
      toBe.BetteiBareiHandi = $R.betteiBareiHandi2.toCodeFromKol(betteiBareiHandiShousai);
    }
    if (toBe.BetteiBareiHandi === null) {
      toBe.BetteiBareiHandiReigai = betteiBareiHandiShousai;
    }
    const kouryuuFlag = $R.kouryuuFlag.toCodesFromKol(buffer, 22, 1);
    const joukenFuka1 = $R.joukenFuka1.toCodesFromKol(buffer, 94, 2);
    const joukenFuka2 = $R.joukenFuka2.toCodesFromKol(buffer, 96, 2);
    const joukenKei = $R.joukenKei.toCodesFromKol(buffer, 98, 1);
    const seed = $R.seed.toCodesFromKol(buffer, 130, 1);
    toBe.JoukenFuka = this.kolRaceTool.getJoukenFuka(kouryuuFlag, joukenFuka1, joukenFuka2, joukenKei, seed);
    toBe.JoukenNenreiSeigen = $R.joukenNenreiSeigen.toCodeFromKol(buffer, 99, 1);
    if (toBe.JoukenNenreiSeigen === null) {
      toBe.JoukenNenreiSeigen = $R.joukenNenreiSeigen2.toCodeFromKol(buffer, 98, 1);
    }
    toBe.Jouken1 = $R.jouken.toCodeFromKol(buffer, 100, 5);
    if (kaisai.ChuuouChihouGaikoku !== 0) {
      toBe.Kumi1 = readPositiveInt(buffer, 105, 2);
      toBe.IjouIkaMiman = $R.ijouIkaMiman.toCodeFromKol(buffer, 107, 1);
      toBe.Jouken2 = $R.jouken.toCodeFromKol(buffer, 108, 5);
      toBe.Kumi2 = readPositiveInt(buffer, 113, 2);
    }
    toBe.DirtShiba = $R.dirtShiba.toCodeFromKol(buffer, 115, 1);
    toBe.MigiHidari = $R.migiHidari.toCodeFromKol(buffer, 116, 1);
    toBe.UchiSoto = $R.uchiSoto.toCodeFromKol(buffer, 117, 1);
    toBe.Course = $R.course.toCodeFromKol(buffer, 118, 1);
    toBe.Kyori = readPositiveInt(buffer, 119, 4);
    toBe.Tousuu = readPositiveInt(buffer, 123, 2);
    toBe.TorikeshiTousuu = readInt(buffer, 125, 2);
    toBe.Pace = $R.pace.toCodeFromKol(buffer, 127, 1);
    toBe.Tenki = $R.tenki.toCodeFromKol(buffer, 128, 1);
    toBe.Baba = $R.baba.toCodeFromKol(buffer, 129, 1);

    return await this.tool.update(Race, asIs, toBe);
  }

  protected async saveShussouba(buffer: Buffer, race: Race, kyousouba: Kyousouba, uma: Uma) {
    let umaban = readPositiveInt(buffer, 1, 2);
    let id: number;
    let asIs: Shussouba;
    if (1 <= umaban && umaban <= 28) {
      id = race.Id * (2 ** 6) + umaban;
      asIs = await this.entityManager.findOneById(Shussouba, id);
    } else {
      umaban = 28;
      do {
        umaban++; // 地方競馬で馬番がない場合 29から始まる
        id = race.Id * (2 ** 6) + umaban;
        asIs = await this.entityManager.findOneById(Shussouba, id);
      } while (asIs && asIs.KyousoubaId !== kyousouba.Id);
    }
    if (asIs) {
      if (asIs.KolSeisekiSakuseiNengappi) {
        return asIs;
      } else if (!asIs.KolShutsubahyouSakuseiNengappi && !asIs.KolSeisekiSakuseiNengappi) {
        return asIs;
      }
    }

    const toBe = new Shussouba();
    toBe.Id = id;
    toBe.RaceId = race.Id;
    toBe.Wakuban = readPositiveInt(buffer, 0, 1);
    toBe.Umaban = umaban;
    toBe.Gate = readPositiveInt(buffer, 3, 2);
    const kyuusha = await this.kolTool.saveKyuusha(buffer, 158);
    toBe.KyousoubaId = (await this.saveKyousoubaOfRace(buffer, kyousouba, uma, kyuusha)).Kyousouba.Id;
    toBe.Nenrei = readPositiveInt(buffer, 8, 2);
    toBe.Blinker = $S.blinker.toCodeFromKol(buffer, 90, 1);
    toBe.Kinryou = readDouble(buffer, 91, 3, 0.1);
    toBe.Bataijuu = readPositiveInt(buffer, 94, 3);
    toBe.Zougen = readInt(buffer, 97, 3);
    toBe.KolRecordShisuu = readInt(buffer, 100, 3);
    toBe.KishuId = (await this.kolTool.saveKishu(buffer, 103, race.Nengappi)).Id;
    toBe.KishuTouzaiBetsu = $C.touzaiBetsu.toCodeFromKol(buffer, 148, 1);
    toBe.KishuShozokuBasho = $C.basho.toCodeFromKol(buffer, 149, 2);
    toBe.KishuShozokuKyuushaId = await this.kolTool.saveShozokuKyuusha(buffer, 151);
    toBe.MinaraiKubun = $S.minaraiKubun.toCodeFromKol(buffer, 156, 1);
    toBe.Norikawari = $S.norikawari.toCodeFromKol(buffer, 157, 1);
    toBe.Ninki = readPositiveInt(buffer, 208, 2);
    toBe.Odds = readDouble(buffer, 210, 5, 0.1);
    toBe.KakuteiChakujun = this.kolRaceTool.getChakujun(buffer, 215, 2);
    toBe.ChakujunFuka = $S.chakujunFuka.toCodeFromKol(buffer, 217, 2);
    toBe.NyuusenChakujun = this.kolRaceTool.getChakujun(buffer, 219, 2);
    toBe.TorikeshiShubetsu = $S.torikeshiShubetsu.toCodeFromKol(buffer, 221, 1);
    toBe.RecordNinshiki = $S.recordNinshiki.toCodeFromKol(buffer, 222, 1);
    toBe.Time = readTime(buffer, 223, 4);
    toBe.Chakusa1 = readInt(buffer, 227, 2);
    toBe.Chakusa2 = $S.chakura2.toCodeFromKol(buffer, 229, 1);
    toBe.TimeSa = this.kolTool.getTimeSa(buffer, 230);
    if (1200 <= race.Kyori) {
      toBe.Ten3F = readDouble(buffer, 233, 3, 0.1);
      if (toBe.Time && toBe.Ten3F) {
        toBe.Ten3FIkou = toBe.Time - toBe.Ten3F;
      }
    }
    toBe.Agari3F = readDouble(buffer, 236, 3, 0.1);
    if (toBe.Time && toBe.Agari3F) {
      toBe.Agari3FIzen = toBe.Time - toBe.Agari3F;
    }
    if (1200 < race.Kyori && toBe.Ten3F && toBe.Agari3F) {
      toBe.Chuukan = toBe.Time - toBe.Ten3F - toBe.Agari3F;
    }
    toBe.YonCornerIchiDori = $C.ichi.toCodeFromKol(buffer, 247, 1);

    return await this.tool.update(Shussouba, asIs, toBe);
  }

  protected async saveShussoubaYosou(buffer: Buffer, shussouba: Shussouba) {
    const toBe = new ShussoubaYosou();
    toBe.Id = shussouba.Id;
    toBe.KolYosou1 = $S.yosou.toCodeFromKol(buffer, 206, 1);
    toBe.KolYosou2 = $S.yosou.toCodeFromKol(buffer, 207, 1);

    const asIs = await this.entityManager.findOneById(ShussoubaYosou, shussouba.Id);

    return await this.tool.update(ShussoubaYosou, asIs, toBe);
  }

  public async saveKyousoubaOfRace(buffer: Buffer, k: Kyousouba, u: Uma, kyuusha: Kyuusha) {
    const seibetsu = $U.seibetsu.toCodeFromKol(buffer, 7, 1);
    let uma = new Uma();
    uma.Bamei = u.Bamei;
    uma.Seibetsu = seibetsu || u.Seibetsu;
    uma = await this.umaDao.saveUma(uma);
    let kyousouba = new Kyousouba();
    kyousouba.UmaId = uma.Id;
    kyousouba.Seibetsu = seibetsu || k.Seibetsu;
    kyousouba.UmaKigou = $U.umaKigou.toCodeFromKol(buffer, 5, 2) || k.UmaKigou;
    const banushi = await this.kolTool.saveBanushi(buffer, 10);
    kyousouba.BanushiId = banushi && banushi.Id || k.BanushiId;
    kyousouba.KyuushaId = kyuusha && kyuusha.Id || k.KyuushaId;
    kyousouba = await this.umaDao.saveKyousouba(kyousouba);
    return { Kyousouba: kyousouba, Uma: uma };
  }

}
