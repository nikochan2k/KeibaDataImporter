import { Inject } from "typedi";
import { JrdbRaceTool } from "./JrdbRaceTool";
import { ShussoubaData } from "./ShussoubaData";
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
import { ShussoubaYosou } from "../../entities/ShussoubaYosou";
import { Uma } from "../../entities/Uma";
import { ShussoubaInfo } from "../RaceTool";
import { RaceTool } from "../RaceTool";
import {
  readDouble,
  readPositiveInt,
  readStr,
  readStrWithNoSpace
} from "../Reader";
import { Tool } from "../Tool";

export abstract class Se$ extends ShussoubaData {

  @Inject()
  protected tool: Tool;

  @Inject()
  protected raceTool: RaceTool;

  @Inject()
  protected jrdbRaceTool: JrdbRaceTool;

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
    const joukenFuka = this.raceTool.getJoukenFuka($R.joukenFuka2.toCodesFromJrdb(buffer, 75, 3));
    if (toBe.JoukenFuka) {
      toBe.JoukenFuka |= joukenFuka;
    } else {
      toBe.JoukenFuka = joukenFuka;
    }
    toBe.BetteiBareiHandi = $R.betteiBareiHandi.toCodeFromJrdb(buffer, 78, 1);
    if (!toBe.Grade || toBe.Grade <= 3) {
      toBe.Grade = $R.grade.toCodeFromJrdb(buffer, 79, 1);
    }
    toBe.TokubetsuMei = readStr(buffer, 80, 50);
    toBe.Tousuu = readPositiveInt(buffer, 130, 2);
    toBe.TanshukuTokubetsuMei = readStr(buffer, 132, 8);
  }

  protected async setShussouba(buffer: Buffer, toBe: Shussouba, info: ShussoubaInfo) {
    toBe.KakuteiChakujun = readPositiveInt(buffer, 140, 2);
    toBe.ChakujunFuka = $S.chakujunFuka.toCodeFromJrdb(buffer, 142, 1);
    toBe.Time = readDouble(buffer, 143, 4, 0.1);
    toBe.Kinryou = readDouble(buffer, 147, 3, 0.1);
    toBe.Odds = readDouble(buffer, 174, 6, 0.1);
    toBe.Ninki = readPositiveInt(buffer, 180, 2);
    await this.setKyousouba(buffer, toBe);
  }

  protected async setKyousouba(buffer: Buffer, toBe: Shussouba) {
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
    toBe.KyousoubaId = kyousouba.Id;
  }

  protected async setShussoubaYosou(buffer: Buffer, toBe: ShussoubaYosou) {
    toBe.Idm = readDouble(buffer, 182, 3);

  }
}