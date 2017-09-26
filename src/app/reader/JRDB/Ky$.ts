import { Inject } from "typedi";
import { JrdbRaceTool } from "./JrdbRaceTool";
import { ShussoubaData } from "./ShussoubaData";
import * as $R from "../../converters/Race";
import * as $S from "../../converters/Shussouba";
import * as $SJ from "../../converters/ShussoubaYosou";
import { Shussouba } from "../../entities/Shussouba";
import { ShussoubaYosou } from "../../entities/ShussoubaYosou";
import { ShussoubaInfo } from "../RaceTool";
import { readDouble, readInt, readPositiveInt } from "../Reader";
import { Tool } from "../Tool";

export abstract class Ky$ extends ShussoubaData {

  @Inject()
  protected tool: Tool;

  @Inject()
  protected jrdbRaceTool: JrdbRaceTool;

  protected async setShussouba(buffer: Buffer, toBe: Shussouba, info: ShussoubaInfo) {
    toBe.Odds = readDouble(buffer, 95, 5);
    toBe.Ninki = readPositiveInt(buffer, 100, 2);
    toBe.FukushouOdds = readDouble(buffer, 102, 5);
    toBe.FukushouNinki = readPositiveInt(buffer, 107, 2);
    toBe.Blinker = $S.blinker.toCodeFromJrdb(buffer, 170, 1);
    toBe.KishuId = (await this.jrdbTool.saveKishu(buffer, info.race.Nengappi)).Id;
    toBe.Kinryou = readDouble(buffer, 183, 3, 0.1);
    toBe.MinaraiKubun = $S.minaraiKubun.toCodeFromJrdb(buffer, 186, 1);
    toBe.KyousoubaId = (await this.jrdbTool.saveKyousouba(buffer)).Id;
    toBe.Wakuban = readPositiveInt(buffer, 323, 1);
    toBe.Bataijuu = readPositiveInt(buffer, 396, 3);
    toBe.Zougen = readInt(buffer, 399, 3);
    toBe.TorikeshiShubetsu = $S.torikeshiShubetsu.toCodeFromJrdb(buffer, 402, 1);
  }

  protected async setShussoubaYosou(buffer: Buffer, toBe: ShussoubaYosou) {
    toBe.Idm = readDouble(buffer, 54, 5);
    toBe.KishuShisuu = readDouble(buffer, 59, 5);
    toBe.JouhouShisuu = readDouble(buffer, 64, 5);
    toBe.SougouShisuu = readDouble(buffer, 84, 5);
    toBe.Kyakushitsu = $SJ.kyakushitsu.toCodeFromJrdb(buffer, 89, 1);
    toBe.KyoriTekisei = $SJ.kyoriTekisei.toCodeFromJrdb(buffer, 90, 1);
    toBe.Joushoudo = $S.joushoudo.toCodeFromJrdb(buffer, 91, 1);
    toBe.Rotation = readInt(buffer, 92, 3);
    toBe.TokuteiJouhouHonmei = readInt(buffer, 109, 3);
    toBe.TokuteiJouhouTaikou = readInt(buffer, 112, 3);
    toBe.TokuteiJouhouTanana = readInt(buffer, 115, 3);
    toBe.TokuteiJouhouRenshita = readInt(buffer, 118, 3);
    toBe.TokuteiJouhouAna = readInt(buffer, 121, 3);
    toBe.SougouJouhouHonmei = readInt(buffer, 124, 3);
    toBe.SougouJouhouTaikou = readInt(buffer, 127, 3);
    toBe.SougouJouhouTanana = readInt(buffer, 130, 3);
    toBe.SougouJouhouRenshita = readInt(buffer, 133, 3);
    toBe.SougouJouhouAna = readInt(buffer, 136, 3);
    toBe.NinkiShisuu = readInt(buffer, 139, 5);
    toBe.ChoukyouShisuu = readDouble(buffer, 144, 5);
    toBe.KyuushaShisuu = readDouble(buffer, 149, 5);
    toBe.ChoukyouYajirushi = $SJ.choukyouYajirushi.toCodeFromJrdb(buffer, 154, 1);
    toBe.KyuushaHyouka = $SJ.kyuushaHyouka.toCodeFromJrdb(buffer, 155, 1);
    toBe.KishuKitaiRentairitsu = readDouble(buffer, 156, 4);
    toBe.GekisouShisuu = readInt(buffer, 160, 3);
    toBe.HidumeCode = $SJ.hidumeCode.toCodeFromJrdb(buffer, 163, 2);
    toBe.OmoTekisei = $S.hyouka.toCodeFromJrdb(buffer, 165, 1);
    toBe.ClassCode = $S.classCode.toCodeFromJrdb(buffer, 166, 2);
    toBe.SougouShirushi = $S.yosou.toCodeFromJrdb(buffer, 326, 1);
    toBe.IdmShirushi = $S.yosou.toCodeFromJrdb(buffer, 327, 1);
    toBe.JouhouShirushi = $S.yosou.toCodeFromJrdb(buffer, 328, 1);
    toBe.KishuShirushi = $S.yosou.toCodeFromJrdb(buffer, 329, 1);
    toBe.KyuushaShirushi = $S.yosou.toCodeFromJrdb(buffer, 330, 1);
    toBe.ChoukyouShirushi = $S.yosou.toCodeFromJrdb(buffer, 331, 1);
    toBe.GekisouShirushi = $S.yosou.toCodeFromJrdb(buffer, 332, 1);
    toBe.ShibaTekisei = $S.hyouka.toCodeFromJrdb(buffer, 333, 1);
    toBe.DirtTekisei = $S.hyouka.toCodeFromJrdb(buffer, 334, 1);
    toBe.KakutokuShoukin = readInt(buffer, 346, 6, 10000);
    toBe.ShuutokuShoukin = readInt(buffer, 352, 5, 10000);
    toBe.JoukenClass = $SJ.joukenGroup.toCodeFromJrdb(buffer, 357, 1);
    toBe.TenShisuu = readDouble(buffer, 358, 5);
    toBe.PaceShisuu = readDouble(buffer, 363, 5);
    toBe.AgariShisuu = readDouble(buffer, 368, 5);
    toBe.IchiShisuu = readDouble(buffer, 373, 5);
    toBe.PaceYosou = $R.pace.toCodeFromJrdb(buffer, 383, 1);
    toBe.DouchuuJuni = readPositiveInt(buffer, 379, 2);
    toBe.DouchuuSa = readDouble(buffer, 381, 2, 0.1);
    toBe.DouchuuUchiSoto = $SJ.courseDori.toCodeFromJrdb(buffer, 383, 1);
    toBe.Agari3FJuni = readPositiveInt(buffer, 384, 2);
    toBe.Agari3FSa = readDouble(buffer, 386, 2, 0.1);
    toBe.Agari3FUchiSoto = $SJ.courseDori.toCodeFromJrdb(buffer, 388, 1);
    toBe.GoalJuni = readPositiveInt(buffer, 389, 2);
    toBe.GoalSa = readDouble(buffer, 391, 2, 0.1);
    toBe.GoalUchiSoto = $SJ.courseDori.toCodeFromJrdb(buffer, 393, 1);
    toBe.TenkaiKigou = $SJ.tenkaiKigou.toCodeFromJrdb(buffer, 394, 1);
    toBe.KyoriTekisei2 = $SJ.kyoriTekisei.toCodeFromJrdb(buffer, 395, 1);
    toBe.GekisouJuni = readPositiveInt(buffer, 448, 2);
    toBe.LsShisuuJuni = readPositiveInt(buffer, 450, 2);
    toBe.TenShisuuJuni = readPositiveInt(buffer, 452, 2);
    toBe.PaceShisuuJuni = readPositiveInt(buffer, 454, 2);
    toBe.AgariShisuuJuni = readPositiveInt(buffer, 456, 2);
    toBe.IchiShisuuJuni = readPositiveInt(buffer, 458, 2);
    toBe.KishuKitaiTanshouRitsu = readDouble(buffer, 460, 4);
    toBe.KishuKitai3ChakunaiRitsu = readDouble(buffer, 464, 4);
    toBe.YosouKubun = $SJ.yusouKubun.toCodeFromJrdb(buffer, 468, 1);
    toBe.SouhouZentai = $SJ.souhouZentai.toCodeFromJrdb(buffer, 469, 1);
    toBe.SouhouAshidukai = $SJ.souhouAshidukai.toCodeFromJrdb(buffer, 470, 1);
    toBe.SouhouKaiten = $SJ.souhouKaiten.toCodeFromJrdb(buffer, 471, 1);
    toBe.SouhouHohaba = $SJ.souhouHohaba.toCodeFromJrdb(buffer, 472, 1);
    toBe.SouhouAshiage = $SJ.souhouAshiage.toCodeFromJrdb(buffer, 473, 1);
    toBe.TaikeiZentai = $SJ.taikeiZentai.toCodeFromJrdb(buffer, 477, 1);
    toBe.TaikeiSenaka = $SJ.taikeiNagasa.toCodeFromJrdb(buffer, 478, 1);
    toBe.TaikeiDou = $SJ.taikeiNagasa.toCodeFromJrdb(buffer, 479, 1);
    toBe.TaikeiShiri = $SJ.taikeiOkisa.toCodeFromJrdb(buffer, 480, 1);
    toBe.TaikeiTomo = $SJ.taikeiKakudo.toCodeFromJrdb(buffer, 481, 1);
    toBe.TaikeiHarabukuro = $SJ.taikeiOkisa.toCodeFromJrdb(buffer, 482, 1);
    toBe.TaikeiAtama = $SJ.taikeiOkisa.toCodeFromJrdb(buffer, 483, 1);
    toBe.TaikeiKubi = $SJ.taikeiNagasa.toCodeFromJrdb(buffer, 484, 1);
    toBe.TaikeiMune = $SJ.taikeiOkisa.toCodeFromJrdb(buffer, 485, 1);
    toBe.TaikeiKata = $SJ.taikeiKakudo.toCodeFromJrdb(buffer, 486, 1);
    toBe.TaikeiMaeNagasa = $SJ.taikeiNagasa.toCodeFromJrdb(buffer, 487, 1);
    toBe.TaikeiUshiroNagasa = $SJ.taikeiNagasa.toCodeFromJrdb(buffer, 488, 1);
    toBe.TaikeiMaeHaba = $SJ.taikeiHohaba.toCodeFromJrdb(buffer, 489, 1);
    toBe.TaikeiUshiroHaba = $SJ.taikeiHohaba.toCodeFromJrdb(buffer, 490, 1);
    toBe.TaikeiMaeTsunagari = $SJ.taikeiNagasa.toCodeFromJrdb(buffer, 491, 1);
    toBe.TaikeiUshiroTsunagari = $SJ.taikeiNagasa.toCodeFromJrdb(buffer, 492, 1);
    toBe.TaikeiO = $SJ.taikeiO.toCodeFromJrdb(buffer, 493, 1);
    toBe.TaikeiFuri = $SJ.taikeiFuri.toCodeFromJrdb(buffer, 494, 1);
    toBe.TaikeiSougou1 = $S.tokki.toCodeFromJrdb(buffer, 501, 3);
    toBe.TaikeiSougou2 = $S.tokki.toCodeFromJrdb(buffer, 504, 3);
    toBe.TaikeiSougou3 = $S.tokki.toCodeFromJrdb(buffer, 507, 3);
    toBe.Tokki1 = $S.tokki.toCodeFromJrdb(buffer, 510, 3);
    toBe.Tokki2 = $S.tokki.toCodeFromJrdb(buffer, 513, 3);
    toBe.Tokki3 = $S.tokki.toCodeFromJrdb(buffer, 516, 3);
    toBe.StartShisuu = readDouble(buffer, 519, 4);
    toBe.DeokureRitsu = readDouble(buffer, 523, 4);
    toBe.MankenShisuu = readInt(buffer, 534, 3);
    toBe.MankenShirushi = $S.yosou.toCodeFromJrdb(buffer, 537, 1);
  }
}