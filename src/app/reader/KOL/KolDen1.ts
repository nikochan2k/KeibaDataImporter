import * as $K from "../../converters/Kaisai";
import * as $R from "../../converters/Race";
import { upsert } from "../../db/helpers";
import { Kaisai } from "../../entities/Kaisai";
import { Race } from "../../entities/Race";
import { bridge } from "../Bridge";
import { readInt, readPositiveInt, readRaw, readStr, readTime } from "../Reader";

import { KolBridge } from "./KolBridge";
import { KolDataToImport } from "./KolDataToImport";
import { kolKaisaiTool } from "./KolKaisaiTool";
import { kolRaceTool } from "./KolRaceTool";

export class KolDen1 extends KolDataToImport {
  protected getBufferLength() {
    return 848;
  }

  protected async setup() {
    const kolBridge = <KolBridge>bridge;
    kolBridge.yosouKyakushitsuMap = new Map<number, number>();
  }

  public async save(buffer: Buffer) {
    const kaisai = await this.saveKaisai(buffer);
    if (!kaisai) {
      return;
    }

    const dataNengappi = readInt(buffer, this.at(418), 8);
    const asIs = await kolRaceTool.getRace(buffer);
    if (asIs?.KolNengappi && dataNengappi <= asIs.KolNengappi) {
      // 既に取り込み済みの場合
      return;
    }

    const race = await this.saveRace(buffer, kaisai, asIs, dataNengappi);
    if (!race) {
      return;
    }

    await this.saveRaceMei(buffer, race);
    this.setYosouTenkai(buffer, race);
  }

  protected async saveKaisai(buffer: Buffer) {
    const toBe = kolKaisaiTool.createKaisai(buffer);
    if (!toBe) {
      return null;
    }
    toBe.Kyuujitsu = $K.kyuujitsu.toCodeFromKol(buffer, 20, 1);
    toBe.Youbi = $K.youbi.toCodeFromKol(buffer, 21, 1);
    toBe.KaisaiKubun = kolKaisaiTool.convertKaisaiKubunFrom(toBe.Basho);
    toBe.ChuuouChihouGaikoku = $K.chuuouChihouGaikoku.toCodeFromKol(buffer, 22, 1);
    return upsert(Kaisai, toBe);
  }

  protected async saveRace(buffer: Buffer, kaisai: Kaisai, asIs: Race, dataNengappi: number) {
    const toBe = kolRaceTool.createRace(buffer, kaisai.Id);
    if (!toBe) {
      return asIs;
    }

    // TODO
    // if (!asIs || !asIs.KolSeisekiSakuseiNengappi) {
    toBe.IppanTokubetsu = $R.ippanTokubetsu.toCodeFromKol(buffer, 23, 1);
    toBe.HeichiShougai = $R.heichiShougai.toCodeFromKol(buffer, 24, 1);
    toBe.JuushouKaisuu = readPositiveInt(buffer, 25, 3);
    toBe.Grade = $R.grade.toCodeFromKol(buffer, 72, 1);
    if (this.has(73)) {
      toBe.JpnFlag = $R.jpnFlag.toCodeFromKol(buffer, this.at(73), 1);
    }
    const betteiBareiHandiReigai = readStr(buffer, this.at(76), 18);
    toBe.BetteiBareiHandi =
      $R.betteiBareiHandi.toCodeFromKol(buffer, this.at(74), 2) ||
      $R.betteiBareiHandi.toCodeFromKol(betteiBareiHandiReigai);
    if (!toBe.BetteiBareiHandi) {
      toBe.BetteiBareiHandiReigai = betteiBareiHandiReigai;
    }

    const joukenFuka = readRaw(buffer, this.at(94), 2);
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
    const joukenFuka2 = readRaw(buffer, this.at(96), 2);
    toBe.JoukenMaruShi =
      $R.joukenMaruShi.toCodeFromKol(joukenFuka) || $R.joukenMaruShi.toCodeFromKol(joukenFuka2);
    toBe.JoukenMaruTokuShi =
      $R.joukenMaruTokuShi.toCodeFromKol(joukenFuka) ||
      $R.joukenMaruTokuShi.toCodeFromKol(joukenFuka2);
    toBe.JoukenKakuShi =
      $R.joukenKakuShi.toCodeFromKol(joukenFuka) || $R.joukenKakuShi.toCodeFromKol(joukenFuka2);
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
    const joukenCut = readRaw(buffer, this.at(98), 1);
    toBe.JoukenSarakei = $R.joukenSaraKei.toCodeFromKol(joukenCut);
    toBe.JoukenAraKei = $R.joukenAraKei.toCodeFromKol(joukenCut);
    toBe.JoukenNenreiSeigen =
      $R.joukenNenreiSeigen.toCodeFromKol(buffer, this.at(99), 1) ||
      $R.joukenNenreiSeigenFromJoukenCut.toCodeFromKol(joukenCut);

    toBe.Jouken1 = $R.jouken.toCodeFromKol(buffer, this.at(100), 5);
    toBe.DirtShiba = $R.dirtShiba.toCodeFromKol(buffer, this.at(105), 1);
    toBe.MigiHidari = $R.migiHidari.toCodeFromKol(buffer, this.at(106), 1);
    toBe.UchiSoto = $R.uchiSoto.toCodeFromKol(buffer, this.at(107), 1);
    toBe.Course = $R.course.toCodeFromKol(buffer, this.at(108), 1);
    toBe.Kyori = readPositiveInt(buffer, this.at(109), 4);
    const courceRecord = await kolRaceTool.getRecord(buffer, this.at(114), 0);
    toBe.CourseRecordId = courceRecord?.Id;
    const kyoriRecord = await kolRaceTool.getRecord(buffer, this.at(167), this.at(220));
    toBe.KyoriRecordId = kyoriRecord?.Id;
    const raceRecord = await kolRaceTool.getRecord(buffer, this.at(222), this.at(275));
    toBe.RaceRecordId = raceRecord?.Id;
    toBe.Shoukin1Chaku = readPositiveInt(buffer, this.at(277), 9);
    toBe.Shoukin2Chaku = readPositiveInt(buffer, this.at(286), 9);
    toBe.Shoukin3Chaku = readPositiveInt(buffer, this.at(295), 9);
    toBe.Shoukin4Chaku = readPositiveInt(buffer, this.at(304), 9);
    toBe.Shoukin5Chaku = readPositiveInt(buffer, this.at(313), 9);
    toBe.FukaShou = readPositiveInt(buffer, this.at(322), 9);
    toBe.MaeuriFlag = $R.maeuriFlag.toCodeFromKol(buffer, this.at(331), 1);
    toBe.YoteiHassouJikan = readStr(buffer, this.at(332), 5);
    toBe.Tousuu = readPositiveInt(buffer, this.at(337), 2);
    toBe.TorikeshiTousuu = readInt(buffer, this.at(339), 2);

    toBe.SuiteiTimeRyou = readTime(buffer, this.at(341), 4);
    toBe.SuiteiTimeOmoFuryou = readTime(buffer, this.at(345), 4);
    toBe.YosouPace = $R.pace.toCodeFromKol(buffer, this.at(349), 1);

    toBe.KolNengappi = dataNengappi;

    return upsert(Race, toBe);
  }

  protected async saveRaceMei(buffer: Buffer, race: Race) {
    await kolRaceTool.saveRaceMei(buffer, 28, 30, race);
    await kolRaceTool.saveRaceMei(buffer, 58, 14, race);
  }

  protected setYosouTenkai(buffer: Buffer, race: Race) {
    if (!this.has(362)) {
      // KD2 には予想展開がない
      return;
    }
    [362, 374, 386, 398].forEach((offset, index) => {
      const kolBridge = <KolBridge>bridge;
      for (let i = 0; i < 4; i++) {
        const umaban = readInt(buffer, offset + i * 2, 2);
        if (1 <= umaban && umaban <= 28) {
          const shussoubaId = race.Id * 2 ** 6 + umaban;
          kolBridge.yosouKyakushitsuMap.set(shussoubaId, index + 1);
        }
      }
    });
  }
}
