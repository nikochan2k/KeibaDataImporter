import { Inject, Service } from "typedi";
import * as $K from "../../../converters/Kaisai";
import * as $R from "../../../converters/Race";
import { Kaisai } from "../../../entities/Kaisai";
import { Race } from "../../../entities/Race";
import { Bridge } from "../../Bridge";
import { DataToImport } from "../../DataToImport";
import {
  readInt,
  readPositiveInt,
  readRaw,
  readStr,
  readTime
} from "../../Reader";
import { Tool } from "../../Tool";
import { KolBridge } from "../KolBridge";
import { KolKaisaiTool } from "../KolKaisaiTool";
import { KolRaceTool } from "../KolRaceTool";

@Service()
export class KolDen1Kd3 extends DataToImport {

  @Inject()
  private tool: Tool;

  @Inject()
  private kolKaisaiTool: KolKaisaiTool;

  @Inject()
  private kolRaceTool: KolRaceTool;

  protected getBufferLength() {
    return 848;
  }

  protected setup(bridge: Bridge) {
    const kolBridge = <KolBridge>bridge;
    kolBridge.yosouKyakushitsuMap = new Map<number, number>();
  }

  public async save(buffer: Buffer, bridge: Bridge) {
    const kaisai = await this.saveKaisai(buffer);
    if (!kaisai) {
      return;
    }

    const dataNengappi = readInt(buffer, 418, 8);
    const asIs = await this.kolRaceTool.getRace(buffer);
    if (asIs && asIs.KolNengappi && dataNengappi <= asIs.KolNengappi) {
      // 既に取り込み済みの場合
      return;
    }

    const race = await this.saveRace(buffer, kaisai, asIs, dataNengappi);
    if (!race) {
      return;
    }

    await this.saveRaceMei(buffer, race);
    this.setYosouTenkai(buffer, race, <KolBridge>bridge);
  }

  protected async saveKaisai(buffer: Buffer) {
    const kyuujitsu = $K.kyuujitsu.toCodeFromKol(buffer, 20, 1);

    const asIs = await this.kolKaisaiTool.getKaisaiWithId(buffer);
    if (asIs && asIs.Kyuujitsu === kyuujitsu) {
      return asIs;
    }

    let toBe = this.kolKaisaiTool.createKaisai(buffer);
    if (!toBe) {
      return null;
    }
    toBe.Kyuujitsu = kyuujitsu;
    toBe.Youbi = $K.youbi.toCodeFromKol(buffer, 21, 1);
    toBe.KaisaiKubun = this.kolKaisaiTool.convertKaisaiKubunFrom(toBe.Basho);
    toBe.ChuuouChihouGaikoku = $K.chuuouChihouGaikoku.toCodeFromKol(buffer, 22, 1);
    toBe = await this.entityManager.save(toBe);
    return toBe;
  }

  protected async saveRace(buffer: Buffer, kaisai: Kaisai, asIs: Race, dataNengappi: number) {
    const toBe = this.kolRaceTool.createRace(buffer, kaisai.Id);
    if (!toBe) {
      return asIs;
    }

    // TODO
    // if (!asIs || !asIs.KolSeisekiSakuseiNengappi) {
    toBe.IppanTokubetsu = $R.ippanTokubetsu.toCodeFromKol(buffer, 23, 1);
    toBe.HeichiShougai = $R.heichiShougai.toCodeFromKol(buffer, 24, 1);
    toBe.JuushouKaisuu = readPositiveInt(buffer, 25, 3);
    toBe.Grade = $R.grade.toCodeFromKol(buffer, 72, 1);
    toBe.JpnFlag = $R.jpnFlag.toCodeFromKol(buffer, 73, 1);
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
    toBe.JoukenKouryuu = $R.joukenKouryuu.toCodeFromKol(joukenFuka);
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

    toBe.Jouken1 = $R.jouken.toCodeFromKol(buffer, 100, 5);
    toBe.DirtShiba = $R.dirtShiba.toCodeFromKol(buffer, 105, 1);
    toBe.MigiHidari = $R.migiHidari.toCodeFromKol(buffer, 106, 1);
    toBe.UchiSoto = $R.uchiSoto.toCodeFromKol(buffer, 107, 1);
    toBe.Course = $R.course.toCodeFromKol(buffer, 108, 1);
    toBe.Kyori = readPositiveInt(buffer, 109, 4);
    const courceRecord = await this.kolRaceTool.getRecord(buffer, 114, 0);
    toBe.CourseRecordId = courceRecord && courceRecord.Id;
    const kyoriRecord = await this.kolRaceTool.getRecord(buffer, 167, 220);
    toBe.KyoriRecordId = kyoriRecord && kyoriRecord.Id;
    const raceRecord = await this.kolRaceTool.getRecord(buffer, 222, 275);
    toBe.RaceRecordId = raceRecord && raceRecord.Id;
    toBe.Shoukin1Chaku = readPositiveInt(buffer, 277, 9);
    toBe.Shoukin2Chaku = readPositiveInt(buffer, 286, 9);
    toBe.Shoukin3Chaku = readPositiveInt(buffer, 295, 9);
    toBe.Shoukin4Chaku = readPositiveInt(buffer, 304, 9);
    toBe.Shoukin5Chaku = readPositiveInt(buffer, 313, 9);
    toBe.FukaShou = readPositiveInt(buffer, 351, 9);
    toBe.MaeuriFlag = $R.maeuriFlag.toCodeFromKol(buffer, 331, 1);
    toBe.YoteiHassouJikan = readStr(buffer, 332, 5);
    toBe.Tousuu = readPositiveInt(buffer, 337, 2);
    toBe.TorikeshiTousuu = readInt(buffer, 339, 2);

    toBe.SuiteiTimeRyou = readTime(buffer, 341, 4);
    toBe.SuiteiTimeOmoFuryou = readTime(buffer, 345, 4);
    toBe.YosouPace = $R.pace.toCodeFromKol(buffer, 349, 1);

    toBe.KolNengappi = dataNengappi;

    return await this.tool.saveOrUpdate(Race, asIs, toBe);
  }

  protected async saveRaceMei(buffer: Buffer, race: Race) {
    await this.kolRaceTool.saveRaceMei(buffer, 28, 30, race);
    await this.kolRaceTool.saveRaceMei(buffer, 58, 14, race);
  }

  protected setYosouTenkai(buffer: Buffer, race: Race, bridge: KolBridge) {
    [362, 374, 386, 398].forEach((offset, index) => {
      for (let i = 0; i < 4; i++) {
        const umaban = readInt(buffer, offset + i * 2, 2);
        if (1 <= umaban && umaban <= 28) {
          const shussoubaId = race.Id * (2 ** 6) + umaban;
          bridge.yosouKyakushitsuMap.set(shussoubaId, index + 1);
        }
      }
    });
  }

}