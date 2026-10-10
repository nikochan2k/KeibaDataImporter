import { Inject, Service } from "typedi";
import * as $R from "../../converters/Race";
import { Race } from "../../entities/Race";
import { KaisaiTool } from "../KaisaiTool";
import { RaceTool } from "../RaceTool";
import { readPositiveInt, readRaw, readStr } from "../Reader";
import { JrdbKaisaiTool } from "./JrdbKaisaiTool";

@Service()
export class JrdbRaceTool extends RaceTool {
  @Inject()
  private jrdbKaisaiTool: JrdbKaisaiTool;

  protected getKaisaiTool() {
    return this.jrdbKaisaiTool;
  }

  public getRace(buffer: Buffer, kaisaiId?: number) {
    if (!kaisaiId) {
      kaisaiId = this.getKaisaiTool().getKaisaiId(buffer);
    }
    return super.getRace(buffer, kaisaiId);
  }

  /**
   * 指定した開催ツールで開催IDを求めて、レースIDを返します。
   * SED のようにレコードに年月日がある場合は、ファイル名の日付ではなくレコードの日付を使う必要があります。
   */
  public getRaceIdBy(buffer: Buffer, kaisaiTool: KaisaiTool) {
    return super.getRaceId(buffer, kaisaiTool.getKaisaiId(buffer));
  }

  public getRaceId(buffer: Buffer) {
    const kaisaiId = this.getKaisaiTool().getKaisaiId(buffer);
    return super.getRaceId(buffer, kaisaiId);
  }

  protected getRaceBangou(buffer: Buffer) {
    let raceBangou = readPositiveInt(buffer, 6, 2);
    if (raceBangou == null) {
      this.logger.debug("レース番号が不正です: " + readRaw(buffer, 6, 2));
      raceBangou = 0;
    }
    return raceBangou;
  }

  /**
   * BAC と SED に共通するレース条件を設定します。
   * 距離から内外までは、種別から重量・グレードまでの並びが両者で同じです。
   * @param kyoriOffset 距離のオフセット(続けて 芝ダ障害・右左・内外)
   * @param shubetsuOffset 種別のオフセット(続けて 条件・記号・重量・グレード)
   */
  public setRaceJouken(buffer: Buffer, toBe: Race, kyoriOffset: number, shubetsuOffset: number) {
    toBe.Kyori = readPositiveInt(buffer, kyoriOffset, 4);
    toBe.DirtShiba = $R.dirtShiba.toCodeFromJrdb(buffer, kyoriOffset + 4, 1);
    toBe.HeichiShougai = $R.heichiShougai.toCodeFromJrdb(buffer, kyoriOffset + 4, 1);
    toBe.MigiHidari = $R.migiHidari.toCodeFromJrdb(buffer, kyoriOffset + 5, 1);
    toBe.UchiSoto = $R.uchiSoto.toCodeFromJrdb(buffer, kyoriOffset + 6, 1);
    toBe.JoukenNenreiSeigen = $R.joukenNenreiSeigen.toCodeFromJrdb(buffer, shubetsuOffset, 2);
    toBe.Jouken1 = $R.jouken.toCodeFromJrdb(buffer, shubetsuOffset + 2, 2);

    toBe.JoukenSarakei = 1;
    const kigou = readStr(buffer, shubetsuOffset + 4, 3);
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

    toBe.BetteiBareiHandi = $R.betteiBareiHandi.toCodeFromJrdb(buffer, shubetsuOffset + 7, 1);
    toBe.IppanTokubetsu = $R.ippanTokubetsu.toCodeFromJrdb(buffer, shubetsuOffset + 8, 1);
    toBe.Grade = $R.grade.toCodeFromJrdb(buffer, shubetsuOffset + 8, 1);
  }
}
