import { RaceData } from "./RaceData";
import * as $K from "../../converters/Kaisai";
import * as $R from "../../converters/Race";
import { Kaisai } from "../../entities/Kaisai";
import { Race } from "../../entities/Race";
import { readPositiveInt, readStr } from "../Reader";

export abstract class Ba$ extends RaceData {

  protected setKaisai(buffer: Buffer, toBe: Kaisai) {
    toBe.KaisaiKubun = $K.kaisaiKubun.toCodeFromJrdb(buffer, 97, 1);
  }

  protected setRace(buffer: Buffer, toBe: Race) {
    const hh = readStr(buffer, 16, 2);
    const mm = readStr(buffer, 18, 2);
    toBe.YoteiHassouJikan = hh + ":" + mm;
    toBe.Kyori = readPositiveInt(buffer, 20, 4);
    toBe.DirtShiba = $R.dirtShiba.toCodeFromJrdb(buffer, 24, 1);
    toBe.HeichiShougai = $R.heichiShougai.toCodeFromJrdb(buffer, 24, 1);
    toBe.MigiHidari = $R.migiHidari.toCodeFromJrdb(buffer, 25, 1);
    toBe.UchiSoto = $R.uchiSoto.toCodeFromJrdb(buffer, 26, 1);
    toBe.JoukenNenreiSeigen = $R.joukenNenreiSeigen.toCodeFromJrdb(buffer, 27, 2);
    toBe.Jouken1 = $R.jouken.toCodeFromJrdb(buffer, 29, 2);

    toBe.JoukenSarakei = 1;
    const kigou = readStr(buffer, 31, 3);
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

    toBe.BetteiBareiHandi = $R.betteiBareiHandi.toCodeFromJrdb(buffer, 34, 1);
    toBe.Grade = $R.grade.toCodeFromJrdb(buffer, 35, 1);
    toBe.TokubetsuMei = readStr(buffer, 36, 50);
    const kaisuu = readStr(buffer, 86, 8);
    const execed = /\d+/.exec(kaisuu);
    if (execed) {
      toBe.JuushouKaisuu = parseInt(execed[0]);
    }
    toBe.Tousuu = readPositiveInt(buffer, 94, 2);
    toBe.Course = $R.course.toCodeFromJrdb(buffer, 96, 1);
    toBe.TanshukuTokubetsuMei = readStr(buffer, 98, 8);
    toBe.RaceMei = readStr(buffer, 106, 18);

    toBe.Shoukin1Chaku = readPositiveInt(buffer, 125, 5, 10000);
    toBe.Shoukin2Chaku = readPositiveInt(buffer, 130, 5, 10000);
    toBe.Shoukin3Chaku = readPositiveInt(buffer, 135, 5, 10000);
    toBe.Shoukin4Chaku = readPositiveInt(buffer, 140, 5, 10000);
    toBe.Shoukin5Chaku = readPositiveInt(buffer, 145, 5, 10000);
    toBe.Shoukin1ChakuSannyuShoukin = readPositiveInt(buffer, 150, 5, 10000);
    toBe.Shoukin2ChakuSannyuShoukin = readPositiveInt(buffer, 155, 5, 10000);
  }

  protected async saveRaceRelated(buffer: Buffer, race: Race) {
  }

}