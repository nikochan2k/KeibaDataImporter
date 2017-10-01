import { Inject } from "typedi";
import { ShussoubaData } from "./ShussoubaData";
import * as $C from "../../converters/Common";
import * as $R from "../../converters/Race";
import * as $S from "../../converters/Shussouba";
import { KishuDao } from "../../daos/KishuDao";
import { KyuushaDao } from "../../daos/KyuushaDao";
import { MeishouDao } from "../../daos/MeishouDao";
import { UmaDao } from "../../daos/UmaDao";
import { Kyousouba } from "../../entities/Kyousouba";
import { Kyuusha } from "../../entities/Kyuusha";
import { Race } from "../../entities/Race";
import { Shussouba } from "../../entities/Shussouba";
import { ShussoubaHyouka } from "../../entities/ShussoubaHyouka";
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
    const toBe = Object.assign(new Race(), asIs);
    if (!this.setRace(buffer, toBe)) {
      return;
    }

    await this.tool.update(Race, asIs, toBe);
  }

  protected setRace(buffer: Buffer, toBe: Race) {
    toBe.DirtShiba = $R.dirtShiba.toCodeFromJrdb(buffer, 66, 1);
    toBe.HeichiShougai = $R.heichiShougai.toCodeFromJrdb(buffer, 66, 1);
    toBe.MigiHidari = $R.migiHidari.toCodeFromJrdb(buffer, 67, 1);
    toBe.UchiSoto = $R.uchiSoto.toCodeFromJrdb(buffer, 68, 1);
    toBe.Baba = $R.baba.toCodeFromJrdb(buffer, 69, 1);
    toBe.BabaSokudo = $R.babaSokudo.toCodeFromJrdb(buffer, 70, 1);
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
    toBe.Pace = $R.pace.toCodeFromJrdb(buffer, 221, 1);
    toBe.PaceShisuu = readDouble(buffer, 238, 5);
  }

  protected async setShussouba(buffer: Buffer, toBe: Shussouba, info: ShussoubaInfo) {
    toBe.KakuteiChakujun = readPositiveInt(buffer, 140, 2);
    toBe.ChakujunFuka = $S.chakujunFuka.toCodeFromJrdb(buffer, 142, 1);
    toBe.Time = readDouble(buffer, 143, 4, 0.1);
    toBe.Kinryou = readDouble(buffer, 147, 3, 0.1);
    const kyousouba = await this.saveKyousouba(buffer, toBe);
    toBe.KyousoubaId = kyousouba.Id;
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
  }

  protected async saveKyousouba(buffer: Buffer, toBe: Shussouba) {
    let uma = new Uma();
    uma.Bamei = readStr(buffer, 26, 36);
    uma = await this.umaDao.saveUma(uma);
    const kishuMeishou = await this.meishouDao.save(readStr(buffer, 150, 12));
    const kishu = await this.kishuDao.getKishuWith(kishuMeishou.Id, uma.Id);
    toBe.KishuId = kishu.Id;
    let kyousouba = new Kyousouba();
    kyousouba.UmaId = uma.Id;
    let kyuusha = new Kyuusha();
    const kyuushaMei = readStrWithNoSpace(buffer, 162, 12);
    kyuusha = await this.kyuushaDao.saveKyuusha(kyuusha, kyuushaMei);
    kyousouba.KyuushaId = kyuusha.Id;
    kyousouba = await this.umaDao.saveKyousouba(kyousouba);
    return kyousouba;
  }

  protected async saveShussoubaRelated(buffer: Buffer, shussouba: Shussouba) {
    await this.saveShussoubaHyouka(buffer, shussouba);
    await this.saveOddsHaitou(buffer, shussouba);
  }

  protected async saveShussoubaHyouka(buffer: Buffer, shussouba: Shussouba) {
    const toBe = new ShussoubaHyouka();
    toBe.Id = shussouba.Id;
    this.setShussoubaHyouka(buffer, toBe);

    const asIs = await this.entityManager.findOneById(ShussoubaHyouka, shussouba.Id);
    if (asIs) {
      await this.tool.update(ShussoubaHyouka, asIs, toBe);
    } else {
      await this.entityManager.save(toBe);
    }
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
  }

  protected async saveOddsHaitou(buffer: Buffer, shussouba: Shussouba) {
    await this.jrdbTool.saveOddsNinki(buffer, shussouba, $C.Kakutei.Zenjitsu, $C.Baken.Tanshou, 174, 6, 180);
  }
}