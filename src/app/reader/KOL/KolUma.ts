import * as $C from "../../converters/Common";
import * as $K from "../../converters/Kaisai";
import * as $KI from "../../converters/Kishu";
import * as $R from "../../converters/Race";
import * as $S from "../../converters/Shussouba";
import { Bagu } from "../../converters/ShussoubaJoutai";
import * as $SY from "../../converters/ShussoubaYosou";
import * as $U from "../../converters/Uma";
import { umaDao } from "../../daos/UmaDao";
import { findOneBy, upsert } from "../../db/helpers";
import { Choukyoushi } from "../../entities/Choukyoushi";
import { Kaisai } from "../../entities/Kaisai";
import { Kyousouba } from "../../entities/Kyousouba";
import { Race } from "../../entities/Race";
import { RaceSeiseki } from "../../entities/RaceSeiseki";
import { Shussouba } from "../../entities/Shussouba";
import { ShussoubaHyouka } from "../../entities/ShussoubaHyouka";
import { Kubun } from "../../entities/ShussoubaJoutai";
import { ShussoubaSeiseki } from "../../entities/ShussoubaSeiseki";
import { ShussoubaYosou } from "../../entities/ShussoubaYosou";
import { Uma } from "../../entities/Uma";
import { DataToImport } from "../DataToImport";
import {
  readInt,
  readPositiveDouble,
  readPositiveInt,
  readRaw,
  readStr,
  readStrWithNoSpace,
  readTime,
} from "../Reader";
import { tool } from "../Tool";
import { kolChoukyouTool } from "./KolChoukyouTool";
import { kolKaisaiTool } from "./KolKaisaiTool";
import { kolOddsHaitouTool } from "./KolOddsHaitouTool";
import { kolRaceTool } from "./KolRaceTool";
import { kolShussoubaTool } from "./KolShussoubaTool";
import { kolTool } from "./KolTool";
import { kolUmaTool } from "./KolUmaTool";

export class KolUma extends DataToImport {
  private static readonly raceOffsets = [1064, 1654, 2244, 2834, 3424];

  protected getBufferLength() {
    return 5166;
  }

  public async save(buffer: Buffer) {
    const result = await this.saveKyousouba(buffer);
    const kyousouba = result.Kyousouba;
    const uma = result.Uma;
    for (let i = 0; i < KolUma.raceOffsets.length; i++) {
      const offset = KolUma.raceOffsets[i];
      const raceBuffer = buffer.slice(offset, offset + 151);

      const raceId = kolRaceTool.getRaceId(raceBuffer);
      if (raceId === null) {
        // 過去走が 5 走に満たない
        continue;
      }
      const raceSeiseki = await findOneBy(RaceSeiseki, { Id: raceId });
      if (raceSeiseki?.KolNengappi) {
        // 既に競走成績レースデータが取り込まれている場合
        continue;
      }

      let race = await findOneBy(Race, { Id: raceId });
      /* tslint:disable:triple-equals */
      if (!race || race.KolNengappi == null) {
        const kaisai = await this.saveKaisai(raceBuffer);
        if (!kaisai) {
          continue;
        }
        race = await this.saveRace(raceBuffer, kaisai, race);
        if (!race) {
          continue;
        }
        await this.saveRaceMei(raceBuffer, race);
      } else if (raceSeiseki && raceSeiseki.KolNengappi === 0) {
        // 既に競走馬データが取り込まれている場合
        continue;
      }
      /* tslint:enable:triple-equals */

      await this.saveRaceSeiseki(raceBuffer, race);

      const shussoubaBuffer = buffer.slice(offset + 151, offset + 590);
      const nen = readInt(raceBuffer, 2, 4);
      const shussouba = await this.saveShussouba(shussoubaBuffer, race, kyousouba, uma, nen);
      if (shussouba) {
        await this.saveShussoubaJoutai(shussoubaBuffer, shussouba);
        await this.saveShussoubaSeiseki(shussoubaBuffer, race, shussouba);
        await this.saveShussoubaYosou(shussoubaBuffer, shussouba);
        await this.saveShussoubaHyouka(shussoubaBuffer, shussouba);
        await kolOddsHaitouTool.saveKakuteiNinkiOdds(shussoubaBuffer, shussouba, 208, 210);
        await kolShussoubaTool.saveShussoubaTsuukaJuni(shussoubaBuffer, 239, shussouba);
        await this.saveChoukyou(shussoubaBuffer, shussouba, uma);
      }
    }
  }

  protected async saveKyousouba(buffer: Buffer) {
    const seibetsu = $U.seibetsu.toCodeFromKol(buffer, 94, 1);
    let uma = {} as Uma;
    uma.KolUmaCode = readInt(buffer, 0, 7);
    const bamei = readStr(buffer, 7, 30);
    if (tool.isEnglish(bamei)) {
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
    const chichiUma = await kolUmaTool.saveOyaUma(buffer, 97, $U.Seibetsu.Boba);
    uma.ChichiUmaId = chichiUma?.Id;
    const hahaUma = await kolUmaTool.saveOyaUma(buffer, 138, $U.Seibetsu.Hinba, 179, 220);
    uma.HahaUmaId = hahaUma?.Id;
    uma.MasshouFlag = $C.masshouFlag.toCodeFromKol(buffer, 544, 1);
    uma.MasshouNengappi = readInt(buffer, 545, 8);
    uma.Jiyuu = readStr(buffer, 553, 6);
    uma.Ikisaki = readStr(buffer, 559, 10);
    uma = await umaDao.saveUma(uma);
    await kolTool.saveSeisansha(buffer, 423, uma.Id);

    let kyousouba = {} as Kyousouba;
    kyousouba.UmaId = uma.Id;
    kyousouba.Seibetsu = seibetsu;
    kyousouba.UmaKigou = $U.umaKigou.toCodeFromKol(buffer, 92, 2);
    const choukyoushi = await kolTool.saveChoukyoushi(buffer, 488);
    kyousouba.ChoukyoushiId = choukyoushi?.Id;
    kyousouba.KoueiGaikokuChoukyoushiMei = readStr(buffer, 536, 8);
    kyousouba = await umaDao.saveKyousouba(kyousouba);

    return { Kyousouba: kyousouba, Uma: uma };
  }

  protected async saveKaisai(buffer: Buffer) {
    const nen = readInt(buffer, 2, 4);
    if (!nen) {
      return null;
    }
    const toBe = kolKaisaiTool.createKaisai(buffer);
    if (!toBe) {
      return null;
    }
    toBe.Kyuujitsu = $K.kyuujitsu.toCodeFromKol(buffer, 20, 1);
    toBe.Youbi = $K.youbi.toCodeFromKol(buffer, 21, 1);
    toBe.KaisaiKubun = kolKaisaiTool.convertKaisaiKubunFrom(toBe.Basho);
    toBe.ChuuouChihouGaikoku = $K.chuuouChihouGaikoku.toCodeFromKol(buffer, 23, 1);
    toBe.GaikokuKeibajouMei = readStr(buffer, 131, 20);
    const asIs = await kolKaisaiTool.getKaisaiWithId(buffer);
    return await tool.saveOrUpdate(Kaisai, asIs, toBe);
  }

  protected async saveRace(buffer: Buffer, kaisai: Kaisai, asIs: Race) {
    const toBe = kolRaceTool.createRace(buffer, kaisai.Id);
    if (!toBe) {
      return null;
    }
    toBe.IppanTokubetsu = $R.ippanTokubetsu.toCodeFromKol(buffer, 24, 1);
    toBe.HeichiShougai = $R.heichiShougai.toCodeFromKol(buffer, 25, 1);
    toBe.JuushouKaisuu = readPositiveInt(buffer, 26, 3);
    toBe.Grade = $R.grade.toCodeFromKol(buffer, 73, 1);
    const betteiBareiHandiReigai = readStr(buffer, 76, 18);
    toBe.BetteiBareiHandi =
      $R.betteiBareiHandi.toCodeFromKol(buffer, 74, 2) ||
      $R.betteiBareiHandi.toCodeFromKol(betteiBareiHandiReigai);
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
    toBe.JoukenMaruShi =
      $R.joukenMaruShi.toCodeFromKol(joukenFuka) || $R.joukenMaruShi.toCodeFromKol(joukenFuka2);
    toBe.JoukenMaruTokuShi =
      $R.joukenMaruTokuShi.toCodeFromKol(joukenFuka) ||
      $R.joukenMaruTokuShi.toCodeFromKol(joukenFuka2);
    toBe.JoukenKakuShi =
      $R.joukenKakuShi.toCodeFromKol(joukenFuka) || $R.joukenKakuShi.toCodeFromKol(joukenFuka2);
    toBe.JoukenShounyuu = $R.joukenShounyuu.toCodeFromKol(joukenFuka);
    toBe.JoukenNaikokusan = $R.joukenNaikokusan.toCodeFromKol(joukenFuka);
    toBe.JoukenKouryuu =
      $R.joukenKouryuu.toCodeFromKol(joukenFuka) || $R.joukenKouryuu.toCodeFromKol(buffer, 22, 1);
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
    toBe.JoukenNenreiSeigen =
      $R.joukenNenreiSeigen.toCodeFromKol(buffer, 99, 1) ||
      $R.joukenNenreiSeigenFromJoukenCut.toCodeFromKol(joukenCut);
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
    toBe.KolNengappi = 0;

    return await tool.saveOrUpdate(Race, asIs, toBe);
  }

  protected async saveRaceMei(buffer: Buffer, race: Race) {
    await kolRaceTool.saveRaceMei(buffer, 29, 30, race);
    await kolRaceTool.saveRaceMei(buffer, 59, 14, race);
  }

  protected async saveRaceSeiseki(buffer: Buffer, race: Race) {
    const toBe = {} as RaceSeiseki;
    toBe.Id = race.Id;
    toBe.Pace = $R.pace.toCodeFromKol(buffer, 127, 1);
    toBe.Tenki = $R.tenki.toCodeFromKol(buffer, 128, 1);
    toBe.Baba = $R.baba.toCodeFromKol(buffer, 129, 1);
    toBe.KolNengappi = 0;

    upsert(RaceSeiseki, toBe);
  }

  protected async saveShussouba(
    buffer: Buffer,
    race: Race,
    kyousouba: Kyousouba,
    _uma: Uma,
    nen: number,
  ) {
    const umaban = readPositiveInt(buffer, 1, 2) || 0;
    const id = race.Id * 2 ** 6 + umaban;
    const asIs = await findOneBy(Shussouba, { Id: id });
    if (asIs) {
      return null;
    }

    const toBe = {} as Shussouba;
    toBe.Id = id;
    toBe.RaceId = race.Id;
    toBe.Wakuban = readPositiveInt(buffer, 0, 1);
    toBe.Umaban = umaban;
    const choukyoushi = await kolTool.saveChoukyoushi(buffer, 158);
    kyousouba = await this.saveKyousoubaOfRace(buffer, kyousouba, choukyoushi);
    toBe.KyousoubaId = kyousouba.Id;
    const nenrei = readPositiveInt(buffer, 8, 2);
    toBe.Nenrei = tool.normalizeNenrei(nenrei, nen);
    toBe.KolNengappi = 0;

    const shussouba = await tool.saveOrUpdate(Shussouba, asIs, toBe);
    await kolTool.saveBanushi(buffer, 10, shussouba.Id);
    return shussouba;
  }

  protected async saveShussoubaJoutai(buffer: Buffer, shussouba: Shussouba) {
    const blinker = readPositiveInt(buffer, 90, 1);
    if (0 < blinker) {
      await kolShussoubaTool.saveShussoubaJoutai(shussouba.Id, Kubun.Bagu, Bagu.Blinker);
    }
  }

  protected async saveShussoubaSeiseki(buffer: Buffer, race: Race, shussouba: Shussouba) {
    const toBe = {} as ShussoubaSeiseki;
    toBe.Id = shussouba.Id;
    toBe.Gate = readPositiveInt(buffer, 3, 2);
    toBe.Bataijuu = readPositiveInt(buffer, 94, 3);
    toBe.Kinryou = readPositiveDouble(buffer, 91, 3, 0.1);
    toBe.Zougen = readInt(buffer, 97, 3);
    const kishu = await kolTool.saveKishu(buffer, 103);
    toBe.KishuId = kishu.Id;
    toBe.KishuTouzaiBetsu = $C.touzaiBetsu.toCodeFromKol(buffer, 148, 1);
    toBe.KishuShozokuBasho = $C.basho.toCodeFromKol(buffer, 149, 2);
    toBe.KishuShozokuChoukyoushiId = await kolTool.saveShozokuChoukyoushi(buffer, 151);
    toBe.MinaraiKubun = $KI.minaraiKubun.toCodeFromKol(buffer, 156, 1);
    toBe.Norikawari = $S.norikawari.toCodeFromKol(buffer, 157, 1);
    toBe.KakuteiChakujun = tool.getChakujun(buffer, 215, 2);
    toBe.ChakujunFuka = $S.chakujunFuka.toCodeFromKol(buffer, 217, 2);
    toBe.NyuusenChakujun = tool.getChakujun(buffer, 219, 2);
    toBe.TorikeshiShubetsu = $S.torikeshiShubetsu.toCodeFromKol(buffer, 221, 1);
    toBe.RecordNinshiki = $S.recordNinshiki.toCodeFromKol(buffer, 222, 1);
    toBe.Time = readTime(buffer, 223, 4);
    toBe.Chakusa1 = readInt(buffer, 227, 2);
    toBe.Chakusa2 = $S.chakura2.toCodeFromKol(buffer, 229, 1);
    toBe.TimeSa = kolShussoubaTool.getTimeSa(buffer, 230);

    if (1200 <= race.Kyori) {
      toBe.Ten3F = readPositiveDouble(buffer, 233, 3, 0.1);
      if (toBe.Time && toBe.Ten3F) {
        toBe.Ten3FIkou = toBe.Time - toBe.Ten3F;
      }
    }
    toBe.Agari3F = readPositiveDouble(buffer, 236, 3, 0.1);
    if (toBe.Time && toBe.Agari3F) {
      toBe.Agari3FIzen = toBe.Time - toBe.Agari3F;
    }
    if (1200 < race.Kyori && toBe.Ten3F && toBe.Agari3F) {
      toBe.Douchuu = toBe.Time - toBe.Ten3F - toBe.Agari3F;
    }
    toBe.YonCornerIchiDori = $S.ichi.toCodeFromKol(buffer, 247, 1);

    return upsert(ShussoubaSeiseki, toBe);
  }

  protected async saveShussoubaYosou(buffer: Buffer, shussouba: Shussouba) {
    const toBe = {} as ShussoubaYosou;
    toBe.Id = shussouba.Id;
    toBe.KolYosou1 = $SY.shirushi.toCodeFromKol(buffer, 206, 1);
    toBe.KolYosou2 = $SY.shirushi.toCodeFromKol(buffer, 207, 1);

    return upsert(ShussoubaYosou, toBe);
  }

  protected async saveShussoubaHyouka(buffer: Buffer, shussouba: Shussouba) {
    const toBe = {} as ShussoubaHyouka;
    toBe.Id = shussouba.Id;
    toBe.KolRecordShisuu = readInt(buffer, 100, 3);

    return upsert(ShussoubaHyouka, toBe);
  }

  protected async saveChoukyou(buffer: Buffer, shussouba: Shussouba, uma: Uma) {
    const tanshukuKishuMei = readStrWithNoSpace(buffer, 140, 8);
    await kolChoukyouTool.saveChoukyou(buffer, 248, shussouba.Id, uma.Id, tanshukuKishuMei);
  }

  public async saveKyousoubaOfRace(buffer: Buffer, k: Kyousouba, choukyoushi: Choukyoushi) {
    const seibetsu = $U.seibetsu.toCodeFromKol(buffer, 7, 1);
    let kyousouba = {} as Kyousouba;
    kyousouba.UmaId = k.UmaId;
    kyousouba.Seibetsu = seibetsu || k.Seibetsu;
    kyousouba.UmaKigou = $U.umaKigou.toCodeFromKol(buffer, 5, 2) || k.UmaKigou;
    kyousouba.ChoukyoushiId = choukyoushi?.Id || k.ChoukyoushiId;
    kyousouba = await umaDao.saveKyousouba(kyousouba);
    return kyousouba;
  }
}
