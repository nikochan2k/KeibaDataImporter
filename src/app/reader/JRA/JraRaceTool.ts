import * as $R from "../../converters/Race";
import { Kaisai } from "../../entities/Kaisai";
import { Race } from "../../entities/Race";
import { RaceTool } from "../RaceTool";
import { readRaw } from "../Reader";
import { tool } from "../Tool";
import { JraKaisaiTool } from "./JraKaisaiTool";
import { getJraTrack } from "./JraTrack";

/** 競走種別コードから、競走条件の年齢制限 (joukenNenreiSeigen) にする */
const nenreiSeigenOf: { [shubetsu: string]: number } = {
  "11": 0,
  "12": 1,
  "13": 5,
  "14": 6,
  "18": 5,
  "19": 6,
  "21": 0,
  "22": 1,
  "23": 5,
  "24": 6,
};

/** レース詳細の、JRA-VAN と JV-Data に共通するコード類 */
export interface JraRaceCodes {
  /** グレードコード (1 バイト) */
  grade: string;
  /** 競走種別コード (2 バイト) */
  shubetsu: string;
  /** 競走記号コード (3 バイト) */
  kigou: string;
  /** 重量種別コード (1 バイト) */
  juuryou: string;
  /** 競走条件コード (3 バイト)。年齢別に 5 つあるうちの、最若年の条件 */
  jouken: string;
  /** トラックコード (2 バイト) */
  track: string;
}

/**
 * JRA-VAN の出馬表・成績と、JV-Data のレース詳細に共通するレースの処理。
 * 「年月日場回日R」の位置は、JraKaisaiTool のサブクラスが決める。
 */
export abstract class JraRaceTool extends RaceTool {
  protected abstract get jraKaisaiTool(): JraKaisaiTool;

  protected getRaceBangou(buffer: Buffer) {
    return this.jraKaisaiTool.getRaceBangou(buffer);
  }

  public getRaceId(buffer: Buffer) {
    return super.getRaceId(buffer, this.jraKaisaiTool.getKaisaiId(buffer));
  }

  public getRace(buffer: Buffer) {
    return super.getRace(buffer, this.jraKaisaiTool.getKaisaiId(buffer));
  }

  /** 開催を保存します。場所や日付が読めないレコードは null。曜日コードがないレコードは youbiOffset を省略します */
  public async saveKaisai(buffer: Buffer, youbiOffset?: number) {
    const kaisaiTool = this.jraKaisaiTool;
    const toBe = kaisaiTool.createKaisai(buffer);
    if (!toBe) {
      return null;
    }
    // 曜日コード 3 は祝日。曜日そのものは日付から求める
    if (youbiOffset != null) {
      toBe.Kyuujitsu = readRaw(buffer, youbiOffset, 1) === "3" ? 1 : undefined;
    }
    kaisaiTool.setYoubi(toBe);
    toBe.KaisaiKubun = kaisaiTool.convertKaisaiKubunFrom(toBe.Basho);
    toBe.ChuuouChihouGaikoku = kaisaiTool.convertChuuouChihouGaikoku(toBe.Basho);
    const asIs = await kaisaiTool.getKaisaiWithId(buffer);
    return await tool.saveOrUpdate(Kaisai, asIs, toBe);
  }

  /** コード類から、レースの種別、条件、コースなどを設定します */
  public setRaceCodes(toBe: Race, codes: JraRaceCodes) {
    toBe.IppanTokubetsu = $R.ippanTokubetsu.toCodeFromJvData(codes.grade);
    toBe.HeichiShougai = $R.heichiShougai.toCodeFromJvData(codes.track);
    toBe.Grade = $R.grade.toCodeFromJvData(codes.grade);

    const shubetsu = codes.shubetsu;
    toBe.JoukenSarakei = $R.joukenSaraKei.toCodeFromJvData(shubetsu);
    toBe.JoukenAraKei = $R.joukenAraKei.toCodeFromJvData(shubetsu);
    toBe.JoukenNenreiSeigen = nenreiSeigenOf[shubetsu];
    toBe.BetteiBareiHandi = $R.betteiBareiHandi.toCodeFromJvData(codes.juuryou);

    // 競走記号 3 バイト: 産地・購買条件、性別制限、交流競走関係
    const kigou = codes.kigou;
    toBe.JoukenBoba = $R.joukenBoba.toCodeFromJvData(kigou);
    toBe.JoukenHinba = $R.joukenHinba.toCodeFromJvData(kigou);
    toBe.JoukenSenba = $R.joukenSenba.toCodeFromJvData(kigou);
    toBe.JoukenMaruKon = $R.joukenMaruKon.toCodeFromJvData(kigou);
    toBe.JoukenMaruChichi = $R.joukenMaruChichi.toCodeFromJvData(kigou);
    toBe.JoukenMaruIchi = $R.joukenMaruIchi.toCodeFromJvData(kigou);
    toBe.JoukenMaruChuu = $R.joukenMaruChuu.toCodeFromJvData(kigou);
    toBe.JoukenKakuChuu = $R.joukenKakuChuu.toCodeFromJvData(kigou);
    toBe.JoukenMaruKokusai = $R.joukenMaruKokusai.toCodeFromJvData(kigou);
    toBe.JoukenMaruShi = $R.joukenMaruShi.toCodeFromJvData(kigou);
    toBe.JoukenMaruTokuShi = $R.joukenMaruTokuShi.toCodeFromJvData(kigou);
    toBe.JoukenKakuShi = $R.joukenKakuShi.toCodeFromJvData(kigou);
    toBe.JoukenWakate = $R.joukenWakate.toCodeFromJvData(kigou);
    toBe.JoukenKyuushuusan = $R.joukenKyuushuusan.toCodeFromJvData(kigou);
    toBe.JoukenKansaiHaifuba = $R.joukenKansaiHaifuba.toCodeFromJvData(kigou);
    toBe.JoukenKantouHaifuba = $R.joukenKantouHaifuba.toCodeFromJvData(kigou);

    toBe.Jouken1 = $R.jouken.toCodeFromJvData(codes.jouken);

    const trackInfo = getJraTrack(codes.track);
    if (trackInfo) {
      toBe.DirtShiba = trackInfo.dirtShiba;
      toBe.MigiHidari = trackInfo.migiHidari;
      toBe.UchiSoto = trackInfo.uchiSoto;
    }
  }

  /**
   * 既存のレースがあれば差分だけを更新して、保存したレースを返します。
   * @param skipNull true のとき、項目が空白のレコードで既存の値を消しません
   */
  public saveOrUpdateRace(asIs: Race, toBe: Race, skipNull = false) {
    return tool.saveOrUpdate(Race, asIs, toBe, skipNull);
  }

  /**
   * 障害競走のラップタイムを保存します。
   * 先頭馬の 1 マイル通過タイム、後 4 ハロン、後 3 ハロンがあり、どれも距離の終わりまでのタイムです。
   * @param minute 1 マイル通過タイムの分
   * @param second 1 マイル通過タイムの秒
   */
  public async saveShougaiLapTime(
    race: Race,
    minute: number | null,
    second: number | null,
    ato4: number | null,
    ato3: number | null,
  ) {
    if (!race.Kyori) {
      return;
    }
    const laps: { lapTime: number; kaishi: number }[] = [];
    if (second) {
      laps.push({ lapTime: (minute || 0) * 60 + second, kaishi: race.Kyori - 1600 });
    }
    if (ato4) {
      laps.push({ lapTime: ato4, kaishi: race.Kyori - 800 });
    }
    if (ato3) {
      laps.push({ lapTime: ato3, kaishi: race.Kyori - 600 });
    }
    for (const lap of laps) {
      await this.saveLap(race, lap.kaishi, race.Kyori, lap.lapTime);
    }
  }
}
