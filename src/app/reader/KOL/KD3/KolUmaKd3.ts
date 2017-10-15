import "reflect-metadata";
import { Inject, Service } from "typedi";
import * as $C from "../../../converters/Common";
import * as $K from "../../../converters/Kaisai";
import * as $R from "../../../converters/Race";
import * as $S from "../../../converters/Shussouba";
import * as $U from "../../../converters/Uma";
import { Kubun } from "../../../entities/ShussoubaJoutai";
import { Bagu } from "../../../converters/ShussoubaJoutai";
import { UmaDao } from "../../../daos/UmaDao";
import { Choukyou } from "../../../entities/Choukyou";
import { Kaisai } from "../../../entities/Kaisai";
import { Kyousouba } from "../../../entities/Kyousouba";
import { Kyuusha } from "../../../entities/Kyuusha";
import { Race } from "../../../entities/Race";
import { RaceSeiseki } from "../../../entities/RaceSeiseki";
import { Shussouba } from "../../../entities/Shussouba";
import { ShussoubaHyouka } from "../../../entities/ShussoubaHyouka";
import { ShussoubaSeiseki } from "../../../entities/ShussoubaSeiseki";
import { ShussoubaYosou } from "../../../entities/ShussoubaYosou";
import { Uma } from "../../../entities/Uma";
import { DataToImport } from "../../DataToImport";
import {
  readDouble,
  readInt,
  readPositiveInt,
  readRaw,
  readStr,
  readStrWithNoSpace,
  readTime
} from "../../Reader";
import { Tool } from "../../Tool";
import { KolTool } from "../KolTool";
import { KolChoukyouTool } from "../KolChoukyouTool";
import { KolRaceTool } from "../KolRaceTool";
import { KolKaisaiTool } from "../KolKaisaiTool";
import { KolShussoubaTool } from "../KolShussoubaTool";
import { KolUmaTool } from "../KolUmaTool";
import { KolOddsHaitouTool } from "../KolOddsHaitouTool";


@Service()
export class KolUmaKd3 extends DataToImport {

  private static readonly raceOffsets = [1064, 1654, 2244, 2834, 3424];

  @Inject()
  private tool: Tool;

  @Inject()
  private kolTool: KolTool;

  @Inject()
  private kolKaisaiTool: KolKaisaiTool;

  @Inject()
  private kolRaceTool: KolRaceTool;

  @Inject()
  private kolShussoubaTool: KolShussoubaTool;

  @Inject()
  private kolUmaTool: KolUmaTool;

  @Inject()
  private kolChoukyouTool: KolChoukyouTool;

  @Inject()
  private kolOddsHaitouTool: KolOddsHaitouTool;

  @Inject()
  private umaDao: UmaDao;

  protected getBufferLength() {
    return 5166;
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

      await this.saveRaceSeiseki(raceBuffer, race);

      const shussoubaBuffer = buffer.slice(offset + 151, offset + 590);
      const shussouba = await this.saveShussouba(shussoubaBuffer, race, kyousouba, uma);
      if (shussouba) {
        await this.saveShussoubaJoutai(shussoubaBuffer, shussouba);
        await this.saveShussoubaSeiseki(shussoubaBuffer, race, shussouba);
        await this.saveShussoubaYosou(shussoubaBuffer, shussouba);
        await this.kolOddsHaitouTool.saveNinkiOdds(shussoubaBuffer, shussouba, 208, 210);
        await this.kolShussoubaTool.saveShussoubaTsuukaJuni(shussoubaBuffer, 239, shussouba);
        await this.saveChoukyou(shussoubaBuffer, shussouba, uma);
      }
    }
  }

  protected async saveKyousouba(buffer: Buffer) {
    const seibetsu = $U.seibetsu.toCodeFromKol(buffer, 94, 1);
    let uma = new Uma();
    uma.KolUmaCode = readInt(buffer, 0, 7);
    const bamei = readStr(buffer, 7, 30);
    if (this.tool.isEnglish(bamei)) {
      uma.EigoBamei = bamei;
    } else {
      uma.KanaBamei = bamei;
    }
    uma.KyuuBamei = readStr(buffer, 37, 40);
    uma.Seinen = readPositiveInt(buffer, 77, 4);
    uma.Seinengappi = readInt(buffer, 77, 8);
    uma.Keiro = $U.keiro.toCodeFromKol(buffer, 85, 2);
    uma.Kesshu = $U.kesshu.toCodeFromKol(buffer, 87, 2);
    uma.Sanchi = $U.sanch.toCodeFromKol(buffer, 89, 3);
    uma.Seibetsu = seibetsu;
    const chichiUma = await this.kolUmaTool.saveOyaUma(buffer, 97, $U.Seibetsu.Boba);
    uma.ChichiUmaId = chichiUma && chichiUma.Id;
    const hahaUma = await this.kolUmaTool.saveOyaUma(buffer, 138, $U.Seibetsu.Hinba, 179, 220);
    uma.HahaUmaId = hahaUma && hahaUma.Id;
    const seisansha = await this.kolTool.saveSeisansha(buffer, 423);
    uma.SeisanshaId = seisansha && seisansha.Id;
    uma.MasshouFlag = $C.masshouFlag.toCodeFromKol(buffer, 544, 1);
    uma.MasshouNengappi = readInt(buffer, 545, 8);
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
    const nen = readInt(buffer, 2, 4);
    if (!nen) {
      return null;
    }
    const kyuujitsu = $K.kyuujitsu.toCodeFromKol(buffer, 20, 1);
    const gaikokuKeibajouMei = readStr(buffer, 131, 20);

    const asIs = await this.kolKaisaiTool.getKaisaiWithId(buffer);
    if (asIs && asIs.Kyuujitsu === kyuujitsu && asIs.GaikokuKeibajouMei === gaikokuKeibajouMei) {
      return asIs;
    }

    const toBe = this.kolKaisaiTool.createKaisai(buffer);
    if (!toBe) {
      return null;
    }
    toBe.Kyuujitsu = kyuujitsu;
    toBe.Youbi = $K.youbi.toCodeFromKol(buffer, 21, 1);
    toBe.KaisaiKubun = this.kolKaisaiTool.convertKaisaiKubunFrom(toBe.Basho);
    toBe.ChuuouChihouGaikoku = $K.chuuouChihouGaikoku.toCodeFromKol(buffer, 23, 1);
    toBe.GaikokuKeibajouMei = gaikokuKeibajouMei;

    return await this.tool.saveOrUpdate(Kaisai, asIs, toBe);
  }

  protected async saveRace(buffer: Buffer, kaisai: Kaisai) {
    const asIs = await this.kolRaceTool.getRace(buffer, kaisai.Id);
    // TODO
    if (asIs) {
      return asIs;
    }

    const toBe = this.kolRaceTool.createRace(buffer, kaisai.Id);
    if (!toBe) {
      return null;
    }
    toBe.IppanTokubetsu = $R.ippanTokubetsu.toCodeFromKol(buffer, 24, 1);
    toBe.HeichiShougai = $R.heichiShougai.toCodeFromKol(buffer, 25, 1);
    toBe.JuushouKaisuu = readPositiveInt(buffer, 26, 3);
    toBe.TokubetsuMei = this.tool.normalizeTokubetsuMei(buffer, 29, 30);
    toBe.TanshukuTokubetsuMei = readStrWithNoSpace(buffer, 59, 14);
    toBe.Grade = $R.grade.toCodeFromKol(buffer, 73, 1);
    const betteiBareiHandiReigai = readStr(buffer, 76, 18);
    toBe.BetteiBareiHandi = $R.betteiBareiHandi.toCodeFromKol(buffer, 74, 2) || $R.betteiBareiHandi.toCodeFromKol(betteiBareiHandiReigai);
    if (!toBe.BetteiBareiHandi) {
      toBe.BetteiBareiHandiReigai = betteiBareiHandiReigai;
    }

    const joukenFuka = readRaw(buffer, 94, 2);
    toBe.JoukenBoba = $R.joukenBoba.toCodeFromKol(joukenFuka);
    toBe.JoukenHinba = $R.joukenHinba.toCodeFromKol(joukenFuka);
    toBe.JoukenSenba = $R.joukenSenba.toCodeFromKol(joukenFuka);
    toBe.JoukenMaruKon = $R.joukenMaruKon.toCodeFromKol(joukenFuka);
    toBe.JoukenMaruChichi = $R.joukenMaruChichi.toCodeFromKol(joukenFuka);
    toBe.JoukenMaruIchi = $R.joukenMaruIchi.toCodeFromKol(joukenFuka);
    toBe.JoukenMaruChuu = $R.joukenMaruChuu.toCodeFromKol(joukenFuka);
    toBe.JoukenKakuChuu = $R.joukenKakuChuu.toCodeFromKol(joukenFuka);
    toBe.JoukenMaruKokusai = $R.joukenMaruKokusai.toCodeFromKol(joukenFuka);
    toBe.JoukenMaruShou = $R.joukenMaruShou.toCodeFromKol(joukenFuka);
    const joukenFuka2 = readRaw(buffer, 96, 2);
    toBe.JoukenMaruShi = $R.joukenMaruShi.toCodeFromKol(joukenFuka) || $R.joukenMaruShi.toCodeFromKol(joukenFuka2);
    toBe.JoukenMaruTokuShi = $R.joukenMaruTokuShi.toCodeFromKol(joukenFuka) || $R.joukenMaruTokuShi.toCodeFromKol(joukenFuka2);
    toBe.JoukenKakuShi = $R.joukenKakuShi.toCodeFromKol(joukenFuka) || $R.joukenKakuShi.toCodeFromKol(joukenFuka2);
    toBe.JoukenShounyuu = $R.joukenShounyuu.toCodeFromKol(joukenFuka);
    toBe.JoukenNaikokusan = $R.joukenNaikokusan.toCodeFromKol(joukenFuka);
    toBe.JoukenKouryuu = $R.joukenKouryuu.toCodeFromKol(joukenFuka) || $R.joukenKouryuu.toCodeFromKol(buffer, 22, 1);
    toBe.JoukenKyuushuusan = $R.joukenKyuushuusan.toCodeFromKol(joukenFuka);
    toBe.JoukenChibasan = $R.joukenChibasan.toCodeFromKol(joukenFuka);
    toBe.JoukenKansaiHaifuba = $R.joukenKansaiHaifuba.toCodeFromKol(joukenFuka);
    toBe.JoukenKantouHaifuba = $R.joukenKantouHaifuba.toCodeFromKol(joukenFuka);
    toBe.JoukenJraNintei = $R.joukenJraNintei.toCodeFromKol(joukenFuka);
    toBe.JoukenJraShitei = $R.joukenJraShitei.toCodeFromKol(joukenFuka);
    toBe.JoukenAshige = $R.joukenAshige.toCodeFromKol(joukenFuka);
    toBe.JoukenKurige = $R.joukenKurige.toCodeFromKol(joukenFuka);
    toBe.JoukenAshigeShiroge = $R.joukenAshigeShiroge.toCodeFromKol(joukenFuka);
    toBe.JoukenKurokage = $R.joukenKurokage.toCodeFromKol(joukenFuka);
    const joukenCut = readRaw(buffer, 98, 1);
    toBe.JoukenSarakei = $R.joukenSaraKei.toCodeFromKol(joukenCut);
    toBe.JoukenAraKei = $R.joukenAraKei.toCodeFromKol(joukenCut);
    toBe.JoukenNenreiSeigen = $R.joukenNenreiSeigen.toCodeFromKol(buffer, 99, 1) || $R.joukenNenreiSeigenFromJoukenCut.toCodeFromKol(joukenCut);
    toBe.JoukenSeed = $R.joukenSeed.toCodeFromKol(buffer, 130, 1);

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

    return await this.tool.saveOrUpdate(Race, asIs, toBe);
  }

  protected async saveRaceSeiseki(buffer: Buffer, race: Race) {
    const toBe = new RaceSeiseki();
    toBe.Id = race.Id;
    toBe.Pace = $R.pace.toCodeFromKol(buffer, 127, 1);
    toBe.Tenki = $R.tenki.toCodeFromKol(buffer, 128, 1);
    toBe.Baba = $R.baba.toCodeFromKol(buffer, 129, 1);

    const asIs = await this.entityManager.findOneById(RaceSeiseki, toBe.Id);

    await this.tool.saveOrUpdate(RaceSeiseki, asIs, toBe);
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
    // TODO
    if (asIs) {
      return null;
    }

    const toBe = new Shussouba();
    toBe.Id = id;
    toBe.RaceId = race.Id;
    toBe.Wakuban = readPositiveInt(buffer, 0, 1);
    toBe.Umaban = umaban;
    const kyuusha = await this.kolTool.saveKyuusha(buffer, 158);
    kyousouba = await this.saveKyousoubaOfRace(buffer, kyousouba, kyuusha);
    toBe.KyousoubaId = kyousouba.Id;
    toBe.Nenrei = readPositiveInt(buffer, 8, 2);
    toBe.Kinryou = readDouble(buffer, 91, 3, 0.1);

    return await this.tool.saveOrUpdate(Shussouba, asIs, toBe);
  }

  protected async saveShussoubaJoutai(buffer: Buffer, shussouba: Shussouba) {
    const blinker = readPositiveInt(buffer, 90, 1);
    if (0 < blinker) {
      this.kolShussoubaTool.saveShussoubaJoutai(shussouba.Id, Kubun.Bagu, Bagu.Blinker);
    }
  }

  protected async saveShussoubaSeiseki(buffer: Buffer, race: Race, shussouba: Shussouba) {
    const toBe = new ShussoubaSeiseki();
    toBe.Id = shussouba.Id;
    toBe.Gate = readPositiveInt(buffer, 3, 2);
    toBe.Bataijuu = readPositiveInt(buffer, 94, 3);
    toBe.Zougen = readInt(buffer, 97, 3);
    const kishu = await this.kolTool.saveKishu(buffer, 103);
    toBe.KishuId = kishu.Id;
    const kishuRireki = await this.kolTool.saveKishuRireki(buffer, 148, kishu);
    toBe.KishuRirekiId = kishuRireki.Id;
    toBe.Norikawari = $S.norikawari.toCodeFromKol(buffer, 157, 1);
    toBe.KakuteiChakujun = this.tool.getChakujun(buffer, 215, 2);
    toBe.ChakujunFuka = $S.chakujunFuka.toCodeFromKol(buffer, 217, 2);
    toBe.NyuusenChakujun = this.tool.getChakujun(buffer, 219, 2);
    toBe.TorikeshiShubetsu = $S.torikeshiShubetsu.toCodeFromKol(buffer, 221, 1);
    toBe.RecordNinshiki = $S.recordNinshiki.toCodeFromKol(buffer, 222, 1);
    toBe.Time = readTime(buffer, 223, 4);
    toBe.Chakusa1 = readInt(buffer, 227, 2);
    toBe.Chakusa2 = $S.chakura2.toCodeFromKol(buffer, 229, 1);
    toBe.TimeSa = this.kolShussoubaTool.getTimeSa(buffer, 230);

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
      toBe.Douchuu = toBe.Time - toBe.Ten3F - toBe.Agari3F;
    }
    toBe.YonCornerIchiDori = $S.ichi.toCodeFromKol(buffer, 247, 1);

    const asIs = await this.entityManager.findOneById(ShussoubaSeiseki, toBe.Id);

    return await this.tool.saveOrUpdate(ShussoubaSeiseki, asIs, toBe);
  }

  protected async saveShussoubaYosou(buffer: Buffer, shussouba: Shussouba) {
    const toBe = new ShussoubaYosou();
    toBe.Id = shussouba.Id;
    toBe.KolYosou1 = $S.yosou.toCodeFromKol(buffer, 206, 1);
    toBe.KolYosou2 = $S.yosou.toCodeFromKol(buffer, 207, 1);

    const asIs = await this.entityManager.findOneById(ShussoubaYosou, shussouba.Id);

    return await this.tool.saveOrUpdate(ShussoubaYosou, asIs, toBe);
  }

  protected async saveShussoubaHyouka(buffer: Buffer, shussouba: Shussouba) {
    const toBe = new ShussoubaHyouka();
    toBe.Id = shussouba.Id;
    toBe.KolRecordShisuu = readInt(buffer, 100, 3);

    const asIs = await this.entityManager.findOneById(ShussoubaHyouka, shussouba.Id);

    return await this.tool.saveOrUpdate(ShussoubaHyouka, asIs, toBe);
  }

  protected async saveChoukyou(buffer: Buffer, shussouba: Shussouba, uma: Uma) {
    const tanshukuKishuMei = readStrWithNoSpace(buffer, 140, 8);
    const choukyou = new Choukyou();
    choukyou.Id = shussouba.Id;
    await this.kolChoukyouTool.saveChoukyou(choukyou);
    await this.kolChoukyouTool.saveChoukyouRireki(buffer, 248, uma.Id, tanshukuKishuMei);
  }

  public async saveKyousoubaOfRace(buffer: Buffer, k: Kyousouba, kyuusha: Kyuusha) {
    const seibetsu = $U.seibetsu.toCodeFromKol(buffer, 7, 1);
    let kyousouba = new Kyousouba();
    kyousouba.UmaId = k.UmaId;
    kyousouba.Seibetsu = seibetsu || k.Seibetsu;
    kyousouba.UmaKigou = $U.umaKigou.toCodeFromKol(buffer, 5, 2) || k.UmaKigou;
    const banushi = await this.kolTool.saveBanushi(buffer, 10);
    kyousouba.BanushiId = banushi && banushi.Id || k.BanushiId;
    kyousouba.KyuushaId = kyuusha && kyuusha.Id || k.KyuushaId;
    kyousouba = await this.umaDao.saveKyousouba(kyousouba);
    return kyousouba;
  }

}
