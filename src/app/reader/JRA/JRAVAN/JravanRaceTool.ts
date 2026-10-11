import { Inject, Service } from "typedi";
import * as $C from "../../../converters/Common";
import * as $R from "../../../converters/Race";
import { JinmeiDao } from "../../../daos/JinmeiDao";
import { UmaDao } from "../../../daos/UmaDao";
import { JinmeiKubun } from "../../../entities/Jinmei";
import { Kaisai } from "../../../entities/Kaisai";
import { Race } from "../../../entities/Race";
import { Record } from "../../../entities/Record";
import { Uma } from "../../../entities/Uma";
import { RaceTool } from "../../RaceTool";
import {
  readPositiveDouble,
  readPositiveInt,
  readRaw,
  readStr,
  readStrWithNoSpace,
  readTime,
} from "../../Reader";
import { JravanKaisaiTool } from "./JravanKaisaiTool";
import { JravanTool } from "./JravanTool";
import { getJravanTrack } from "./JravanTrack";

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

/**
 * 特別登録馬・出馬表１・成績１・オッズ・票数に共通する、先頭 148 バイトまでのレース情報を読みます。
 */
@Service()
export class JravanRaceTool extends RaceTool {
  @Inject()
  private jravanKaisaiTool: JravanKaisaiTool;

  @Inject()
  private jravanTool: JravanTool;

  @Inject()
  private umaDao: UmaDao;

  @Inject()
  private jinmeiDao: JinmeiDao;

  protected getRaceBangou(buffer: Buffer) {
    return readPositiveInt(buffer, 14, 2);
  }

  public getRaceId(buffer: Buffer) {
    const kaisaiId = this.jravanKaisaiTool.getKaisaiId(buffer);
    return super.getRaceId(buffer, kaisaiId);
  }

  public getRace(buffer: Buffer) {
    return super.getRace(buffer, this.jravanKaisaiTool.getKaisaiId(buffer));
  }

  /** 開催を保存します。場所や日付が読めないレコードは null */
  public async saveKaisai(buffer: Buffer, youbiOffset = 16) {
    const toBe = this.jravanKaisaiTool.createKaisai(buffer);
    if (!toBe) {
      return null;
    }
    // 曜日コード 3 は祝日。曜日そのものは日付から求める
    toBe.Kyuujitsu = readRaw(buffer, youbiOffset, 1) === "3" ? 1 : undefined;
    this.jravanKaisaiTool.setYoubi(toBe);
    toBe.KaisaiKubun = this.jravanKaisaiTool.convertKaisaiKubunFrom(toBe.Basho);
    toBe.ChuuouChihouGaikoku = this.jravanKaisaiTool.convertChuuouChihouGaikoku(toBe.Basho);
    const asIs = await this.jravanKaisaiTool.getKaisaiWithId(buffer);
    return await this.tool.saveOrUpdate(Kaisai, asIs, toBe);
  }

  /**
   * 特別登録馬・出馬表１・成績１に共通するレース情報を読みます。
   * 賞金や頭数など、レコードによって位置が違う項目は呼び出し側で読みます。
   */
  public async createRaceWith(buffer: Buffer, kaisaiId: number) {
    const toBe = this.createRace(buffer, kaisaiId);
    if (!toBe) {
      return null;
    }

    toBe.IppanTokubetsu = $R.ippanTokubetsu.toCodeFromJravan(buffer, 86, 1);
    const track = readRaw(buffer, 136, 2);
    toBe.HeichiShougai = $R.heichiShougai.toCodeFromJravan(track);
    toBe.JuushouKaisuu = readPositiveInt(buffer, 83, 3);
    toBe.Grade = $R.grade.toCodeFromJravan(buffer, 86, 1);

    const shubetsu = readRaw(buffer, 87, 2);
    toBe.JoukenSarakei = $R.joukenSaraKei.toCodeFromJravan(shubetsu);
    toBe.JoukenAraKei = $R.joukenAraKei.toCodeFromJravan(shubetsu);
    toBe.JoukenNenreiSeigen = nenreiSeigenOf[shubetsu];
    toBe.BetteiBareiHandi = $R.betteiBareiHandi.toCodeFromJravan(buffer, 92, 1);

    // 競走記号 3 バイト: 産地・購買条件、性別制限、交流競走関係
    const kigou = readRaw(buffer, 89, 3);
    toBe.JoukenBoba = $R.joukenBoba.toCodeFromJravan(kigou);
    toBe.JoukenHinba = $R.joukenHinba.toCodeFromJravan(kigou);
    toBe.JoukenSenba = $R.joukenSenba.toCodeFromJravan(kigou);
    toBe.JoukenMaruKon = $R.joukenMaruKon.toCodeFromJravan(kigou);
    toBe.JoukenMaruChichi = $R.joukenMaruChichi.toCodeFromJravan(kigou);
    toBe.JoukenMaruIchi = $R.joukenMaruIchi.toCodeFromJravan(kigou);
    toBe.JoukenMaruChuu = $R.joukenMaruChuu.toCodeFromJravan(kigou);
    toBe.JoukenKakuChuu = $R.joukenKakuChuu.toCodeFromJravan(kigou);
    toBe.JoukenMaruKokusai = $R.joukenMaruKokusai.toCodeFromJravan(kigou);
    toBe.JoukenMaruShi = $R.joukenMaruShi.toCodeFromJravan(kigou);
    toBe.JoukenMaruTokuShi = $R.joukenMaruTokuShi.toCodeFromJravan(kigou);
    toBe.JoukenKakuShi = $R.joukenKakuShi.toCodeFromJravan(kigou);
    toBe.JoukenWakate = $R.joukenWakate.toCodeFromJravan(kigou);
    toBe.JoukenKyuushuusan = $R.joukenKyuushuusan.toCodeFromJravan(kigou);
    toBe.JoukenKansaiHaifuba = $R.joukenKansaiHaifuba.toCodeFromJravan(kigou);
    toBe.JoukenKantouHaifuba = $R.joukenKantouHaifuba.toCodeFromJravan(kigou);

    // 競走条件は、年齢別に 5 つある。最若年の条件を使う。
    toBe.Jouken1 = $R.jouken.toCodeFromJravan(buffer, 105, 3);

    const trackInfo = getJravanTrack(track);
    if (trackInfo) {
      toBe.DirtShiba = trackInfo.dirtShiba;
      toBe.MigiHidari = trackInfo.migiHidari;
      toBe.UchiSoto = trackInfo.uchiSoto;
    }
    toBe.Kyori = readPositiveInt(buffer, 132, 4);
    toBe.CourseRecordId = (await this.getRecord(buffer, 232))?.Id;
    return toBe;
  }

  /** 既存のレースがあれば差分だけを更新して、保存したレースを返します */
  public saveOrUpdateRace(asIs: Race, toBe: Race) {
    return this.tool.saveOrUpdate(Race, asIs, toBe);
  }

  public async saveRaceMeiOf(buffer: Buffer, mei30Offset: number, mei30Length: number, race: Race) {
    await this.saveRaceMei(buffer, mei30Offset, mei30Length, race);
    await this.saveRaceMei(buffer, 77, 6, race);
  }

  /** コースレコード。馬名がない(古いレコードは時計と日付だけ)ときは null */
  public async getRecord(buffer: Buffer, offset: number) {
    const nengappi = readPositiveInt(buffer, offset + 5, 8);
    const time = readTime(buffer, offset + 1, 4);
    const bamei = readStr(buffer, offset + 35, 18);
    if (!nengappi || !time || !bamei) {
      return null;
    }
    let uma = new Uma();
    const touroku = this.jravanTool.readTouroku(buffer, offset + 25);
    if (touroku) {
      uma.KettouTourokuBangou = touroku.bangou;
      uma.Seinen = touroku.seinen;
    }
    this.jravanTool.setBamei(uma, bamei);
    uma = await this.umaDao.saveUma(uma);

    const record = new Record();
    record.Nengappi = nengappi;
    record.Time = time;
    record.UmaId = uma.Id;
    record.Kinryou = readPositiveDouble(buffer, offset + 54, 3, 0.1);
    const tanshuku = readStrWithNoSpace(buffer, offset + 62, 8);
    const jinmei = await this.jinmeiDao.save(JinmeiKubun.Tanshuku, tanshuku);
    record.TanshukuKishuMeiId = jinmei.Id;
    record.Basho = $C.basho.toCodeFromJravan(buffer, offset + 13, 2);
    return this.raceDao.saveRecord(record);
  }
}
