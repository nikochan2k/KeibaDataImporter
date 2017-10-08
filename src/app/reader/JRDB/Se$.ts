import { Inject } from "typedi";
import { ShussoubaData } from "./ShussoubaData";
import * as $C from "../../converters/Common";
import * as $R from "../../converters/Race";
import * as $S from "../../converters/Shussouba";
import { KishuDao } from "../../daos/KishuDao";
import { KyuushaDao } from "../../daos/KyuushaDao";
import { MeishouDao } from "../../daos/MeishouDao";
import { UmaDao } from "../../daos/UmaDao";
import { Kishu } from "../../entities/Kishu";
import { Kyousouba } from "../../entities/Kyousouba";
import { Kyuusha } from "../../entities/Kyuusha";
import { Race } from "../../entities/Race";
import { RaceSeiseki } from "../../entities/RaceSeiseki";
import { Shussouba } from "../../entities/Shussouba";
import { ShussoubaSeiseki } from "../../entities/ShussoubaSeiseki";
import { ShussoubaHyouka } from "../../entities/ShussoubaHyouka";
import { ShussoubaTsuukaJuni } from "../../entities/ShussoubaTsuukaJuni";
import { Uma } from "../../entities/Uma";
import { ShussoubaInfo } from "../ImportTool";
import {
  readDouble,
  readInt,
  readPositiveInt,
  readStr,
  readStrWithNoSpace
} from "../Reader";

export abstract class Se$ extends ShussoubaData {

  @Inject()
  protected kishuDao: KishuDao;

  @Inject()
  protected meishouDao: MeishouDao;

  @Inject()
  protected umaDao: UmaDao;

  @Inject()
  protected kyuushaDao: KyuushaDao;

  protected async saveRace(buffer: Buffer, asIs: Race) {
    let toBe = Object.assign(new Race(), asIs);
    this.setRace(buffer, toBe);

    toBe = await this.tool.saveOrUpdate(Race, asIs, toBe);

    await this.saveRaceSeiseki(buffer, toBe);
  }

  protected async saveRaceSeiseki(buffer: Buffer, race: Race) {
    const toBe = new RaceSeiseki();
    toBe.Id = race.Id;
    this.setRaceSeiseki(buffer, toBe);

    const asIs = await this.entityManager.findOneById(RaceSeiseki, toBe.Id);

    await this.tool.saveOrUpdate(RaceSeiseki, asIs, toBe);
  }

  protected setRace(buffer: Buffer, toBe: Race) {
    toBe.DirtShiba = $R.dirtShiba.toCodeFromJrdb(buffer, 66, 1);
    toBe.HeichiShougai = $R.heichiShougai.toCodeFromJrdb(buffer, 66, 1);
    toBe.MigiHidari = $R.migiHidari.toCodeFromJrdb(buffer, 67, 1);
    toBe.UchiSoto = $R.uchiSoto.toCodeFromJrdb(buffer, 68, 1);
    toBe.JoukenNenreiSeigen = $R.joukenNenreiSeigen.toCodeFromJrdb(buffer, 71, 2);
    toBe.Jouken1 = $R.jouken.toCodeFromJrdb(buffer, 73, 2);

    toBe.JoukenSarakei = 1;
    const kigou = readStr(buffer, 75, 3);
    toBe.JoukenBoba = $R.joukenBoba.toCodeFromJrdb(kigou);
    toBe.JoukenHinba = $R.joukenHinba.toCodeFromJrdb(kigou);
    toBe.JoukenSenba = $R.joukenSenba.toCodeFromJrdb(kigou);
    toBe.JoukenMaruKon = $R.joukenMaruKon.toCodeFromJrdb(kigou);
    toBe.JoukenMaruChichi = $R.joukenMaruChichi.toCodeFromJrdb(kigou);
    toBe.JoukenMaruIchi = $R.joukenMaruIchi.toCodeFromJrdb(kigou);
    toBe.JoukenMaruChuu = $R.joukenMaruChuu.toCodeFromJrdb(kigou);
    toBe.JoukenMaruKokusai = $R.joukenMaruKokusai.toCodeFromJrdb(kigou);
    toBe.JoukenMaruShi = $R.joukenMaruShi.toCodeFromJrdb(kigou);
    toBe.JoukenMaruTokuShi = $R.joukenMaruTokuShi.toCodeFromJrdb(kigou);
    toBe.JoukenKakuShi = $R.joukenKakuShi.toCodeFromJrdb(kigou);
    toBe.JoukenKouryuu = $R.joukenKouryuu.toCodeFromJrdb(kigou);
    toBe.JoukenWakate = $R.joukenWakate.toCodeFromJrdb(kigou);
    toBe.JoukenKyuushuusan = $R.joukenKyuushuusan.toCodeFromJrdb(kigou);

    toBe.BetteiBareiHandi = $R.betteiBareiHandi.toCodeFromJrdb(buffer, 78, 1);
    toBe.TokubetsuMei = readStr(buffer, 80, 50);
    toBe.Tousuu = readPositiveInt(buffer, 130, 2);
    toBe.TanshukuTokubetsuMei = readStr(buffer, 132, 8);

    toBe.Course = $R.course.toCodeFromJrdb(buffer, 339, 1);
  }

  protected setRaceSeiseki(buffer: Buffer, toBe: RaceSeiseki) {
    toBe.Baba = $R.baba.toCodeFromJrdb(buffer, 69, 1);
    toBe.BabaSokudo = $R.babaSokudo.toCodeFromJrdb(buffer, 70, 1);
    toBe.Pace = $R.pace.toCodeFromJrdb(buffer, 221, 1);
    toBe.PaceShisuu = readDouble(buffer, 238, 5);
    toBe.Tenki = $R.tenki.toCodeFromJrdb(buffer, 338, 1);
  }

  protected async setShussouba(buffer: Buffer, toBe: Shussouba, info: ShussoubaInfo) {
    toBe.Kinryou = readDouble(buffer, 147, 3, 0.1);
    const kyousouba = await this.saveKyousouba(buffer, toBe);
    toBe.KyousoubaId = kyousouba.Id;
  }

  protected async saveKyousouba(buffer: Buffer, toBe: Shussouba) {
    let uma = new Uma();
    uma.Bamei = readStr(buffer, 26, 36);
    uma = await this.umaDao.saveUma(uma);
    const kishu = await this.saveKishu(buffer, uma);
    toBe.KishuId = kishu.Id;
    let kyousouba = new Kyousouba();
    kyousouba.UmaId = uma.Id;
    const kyuusha = await this.saveKyuusha(buffer);
    kyousouba.KyuushaId = kyuusha.Id;
    kyousouba = await this.umaDao.saveKyousouba(kyousouba);
    return kyousouba;
  }

  protected async saveKishu(buffer: Buffer, uma: Uma) {
    const kishu = new Kishu();
    kishu.JrdbKishuCode = readInt(buffer, 322, 5);
    const kishuMei = readStr(buffer, 150, 12);
    return this.kishuDao.saveKishu(kishu, kishuMei);
  }

  protected async saveKyuusha(buffer: Buffer) {
    const kyuusha = new Kyuusha();
    kyuusha.JrdbKyuushaCode = readInt(buffer, 327, 5);
    const kyuushaMei = readStrWithNoSpace(buffer, 162, 12);
    return this.kyuushaDao.saveKyuusha(kyuusha, kyuushaMei);
  }

  protected async saveShussoubaRelated(buffer: Buffer, info: ShussoubaInfo) {
    await this.saveShussoubaHyouka(buffer, info.shussouba);
    await this.saveOddsHaitou(buffer, info.shussouba);
    await this.saveShussoubaTsuukaJuni(buffer, info.shussouba);
  }

  protected async saveShussoubaSeiseki(buffer: Buffer, info: ShussoubaInfo) {
    const toBe = new ShussoubaSeiseki();
    toBe.Id = info.shussouba.Id;
    this.setShussoubaSeiseki(buffer, toBe, info);
    const asIs = await this.entityManager.findOneById(ShussoubaSeiseki, toBe.Id);
    await this.tool.saveOrUpdate(ShussoubaHyouka, asIs, toBe);
  }

  protected setShussoubaSeiseki(buffer: Buffer, toBe: ShussoubaSeiseki, info: ShussoubaInfo) {
    toBe.KakuteiChakujun = readPositiveInt(buffer, 140, 2);
    toBe.ChakujunFuka = $S.chakujunFuka.toCodeFromJrdb(buffer, 142, 1);
    toBe.Time = readDouble(buffer, 143, 4, 0.1);
    if (1200 <= info.race.Kyori) {
      toBe.Ten3F = readDouble(buffer, 258, 3, 0.1);
      if (toBe.Time && toBe.Ten3F) {
        toBe.Ten3FIkou = toBe.Time - toBe.Ten3F;
      }
    }
    toBe.Agari3F = readDouble(buffer, 261, 3, 0.1);
    if (toBe.Time && toBe.Agari3F) {
      toBe.Agari3FIzen = toBe.Time - toBe.Agari3F;
    }
    if (1200 < info.race.Kyori && toBe.Ten3F && toBe.Agari3F) {
      toBe.Douchuu = toBe.Time - toBe.Ten3F - toBe.Agari3F;
    }
    toBe.Bataijuu = readPositiveInt(buffer, 332, 3);
    toBe.Zougen = readInt(buffer, 335, 3);
  }

  protected async saveShussoubaHyouka(buffer: Buffer, shussouba: Shussouba) {
    const toBe = new ShussoubaHyouka();
    toBe.Id = shussouba.Id;
    this.setShussoubaHyouka(buffer, toBe);

    const asIs = await this.entityManager.findOneById(ShussoubaHyouka, shussouba.Id);
    await this.tool.saveOrUpdate(ShussoubaHyouka, asIs, toBe);
  }

  protected setShussoubaHyouka(buffer: Buffer, toBe: ShussoubaHyouka) {
    toBe.Idm = readInt(buffer, 182, 3);
    toBe.IdmSoten = readInt(buffer, 185, 3);
    toBe.IdmBabasa = readInt(buffer, 188, 3);
    toBe.IdmPace = readInt(buffer, 191, 3);
    toBe.IdmDeokure = readInt(buffer, 194, 3);
    toBe.IdmIchidori = readInt(buffer, 197, 3);
    toBe.IdmFuri = readInt(buffer, 200, 3);
    toBe.IdmTen3FFuri = readInt(buffer, 203, 3);
    toBe.IdmDouchuuFuri = readInt(buffer, 206, 3);
    toBe.IdmAgari3FFuri = readInt(buffer, 209, 3);
    toBe.IdmRace = readInt(buffer, 212, 3);
    toBe.CourseDori = $S.ichi.toCodeFromJrdb(buffer, 215, 1);
    toBe.JoushoudoCode = $S.joushoudo.toCodeFromJrdb(buffer, 216, 1);
    toBe.ClassCode = $S.classCode.toCodeFromJrdb(buffer, 217, 2);
    toBe.BataiCode = $S.bataiCode.toCodeFromJrdb(buffer, 219, 1);
    toBe.KehaiCode = $S.bataiCode.toCodeFromJrdb(buffer, 220, 1);
    toBe.Pace = $R.pace.toCodeFromJrdb(buffer, 222, 1);
    toBe.Ten3FShisuu = readDouble(buffer, 223, 5);
    toBe.Agari3FShisuu = readDouble(buffer, 228, 5);
    toBe.PaceShisuu = readDouble(buffer, 233, 5);

    toBe.Kyakushitsu = $S.kyakushitsu.toCodeFromJrdb(buffer, 340, 1);
  }

  protected async saveOddsHaitou(buffer: Buffer, shussouba: Shussouba) {
    await this.jrdbTool.saveOddsNinki(buffer, shussouba, {
      Kakutei: $C.Kakutei.Kakutei,
      Baken: $C.Baken.Tanshou,
      OddsOffset: 174,
      OddsLength: 6,
      NinkiOffset: 180
    });
    await this.jrdbTool.saveOddsNinki(buffer, shussouba, {
      Kakutei: $C.Kakutei.Kakutei,
      Baken: $C.Baken.Fukushou,
      OddsOffset: 290,
      OddsLength: 6
    });
    await this.jrdbTool.saveOddsNinki(buffer, shussouba, {
      Kakutei: $C.Kakutei.ToujitsuAM,
      Baken: $C.Baken.Tanshou,
      OddsOffset: 296,
      OddsLength: 6
    });
    await this.jrdbTool.saveOddsNinki(buffer, shussouba, {
      Kakutei: $C.Kakutei.ToujitsuAM,
      Baken: $C.Baken.Fukushou,
      OddsOffset: 302,
      OddsLength: 6
    });
  }

  protected async saveShussoubaTsuukaJuni(buffer: Buffer, shussouba: Shussouba) {
    for (let bangou = 1, offset = 308; bangou <= 4; bangou++ , offset += 2) {
      const shussoubaTsuukaJuni = new ShussoubaTsuukaJuni();

      const juni = readPositiveInt(buffer, offset, 2);
      if (juni === null || 28 < juni) {
        continue;
      }
      shussoubaTsuukaJuni.Id = shussouba.Id * (2 ** 3) + bangou;
      shussoubaTsuukaJuni.ShussoubaId = shussouba.Id;
      shussoubaTsuukaJuni.Bangou = bangou;
      shussoubaTsuukaJuni.Juni = juni;
      await this.entityManager.save(shussoubaTsuukaJuni);
    }
  }
}