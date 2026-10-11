import { Baken, Kakutei } from "../../../converters/Common";
import * as $R from "../../../converters/Race";
import { findOneBy, upsert } from "../../../db/helpers";
import { Race } from "../../../entities/Race";
import { RaceSeiseki } from "../../../entities/RaceSeiseki";
import { DataToImport } from "../../DataToImport";
import { HaitouInfo } from "../../OddsHaitouTool";
import { readInt, readJikan, readPositiveInt, readRaw } from "../../Reader";
import { jravanOddsHaitouTool } from "./JravanOddsHaitouTool";
import { jravanRaceTool } from "./JravanRaceTool";
import { jravanSeiUmaLength, jravanShussoubaTool } from "./JravanShussoubaTool";

/** 成績１ (JracSei1.dat): 成績・着順・払戻金 (馬番 1〜18) */
export class JravanSei1 extends DataToImport {
  protected getBufferLength() {
    return 3048;
  }

  public async save(buffer: Buffer) {
    const kaisai = await jravanRaceTool.saveKaisai(buffer);
    if (!kaisai) {
      return;
    }
    const race = await this.saveRace(buffer, kaisai.Id);
    if (!race) {
      return;
    }
    await this.saveRaceSeiseki(buffer, race);
    await this.saveRaceLapTime(buffer, race);
    await jravanOddsHaitouTool.saveRaceHaitou(
      buffer,
      race.Id,
      Kakutei.Kakutei,
      JravanSei1.haitouInfos(),
    );

    const raceNengappi = readInt(buffer, 0, 8);
    for (let i = 0; i < 18; i++) {
      const uma = jravanShussoubaTool.slice(buffer, 724, i, jravanSeiUmaLength);
      if (!jravanShussoubaTool.hasUma(uma)) {
        continue;
      }
      const saved = await jravanShussoubaTool.saveJravanShussoubaOf(uma, race, kaisai.Nen);
      if (saved) {
        await jravanShussoubaTool.saveSeisekiOf(uma, race, raceNengappi, saved);
      }
    }
  }

  protected async saveRace(buffer: Buffer, kaisaiId: number) {
    const toBe = await jravanRaceTool.createRaceWith(buffer, kaisaiId);
    if (!toBe) {
      return null;
    }
    toBe.YoteiHassouJikan = readJikan(buffer, 319);
    toBe.MaeuriFlag = readRaw(buffer, 323, 1) === "1" ? 1 : undefined;
    toBe.Tousuu = readPositiveInt(buffer, 324, 2);
    toBe.Shoukin1Chaku = readPositiveInt(buffer, 148, 7, 1000);
    toBe.Shoukin2Chaku = readPositiveInt(buffer, 155, 7, 1000);
    toBe.Shoukin3Chaku = readPositiveInt(buffer, 162, 7, 1000);
    toBe.Shoukin4Chaku = readPositiveInt(buffer, 169, 7, 1000);
    toBe.Shoukin5Chaku = readPositiveInt(buffer, 176, 7, 1000);
    toBe.FukaShou = readPositiveInt(buffer, 197, 7, 1000);
    const asIs = await findOneBy(Race, { Id: toBe.Id });
    const race = await jravanRaceTool.saveOrUpdateRace(asIs, toBe);
    await jravanRaceTool.saveRaceMeiOf(buffer, 17, 60, race);
    return race;
  }

  protected async saveRaceSeiseki(buffer: Buffer, race: Race) {
    const toBe = {} as RaceSeiseki;
    toBe.Id = race.Id;
    toBe.Shoukin1Chaku = readPositiveInt(buffer, 148, 7, 1000);
    toBe.Shoukin2Chaku = readPositiveInt(buffer, 155, 7, 1000);
    toBe.Shoukin3Chaku = readPositiveInt(buffer, 162, 7, 1000);
    toBe.Shoukin4Chaku = readPositiveInt(buffer, 169, 7, 1000);
    toBe.Shoukin5Chaku = readPositiveInt(buffer, 176, 7, 1000);
    toBe.Shoukin5ChakuDouchaku = readPositiveInt(buffer, 183, 7, 1000);
    toBe.Shoukin5ChakuDouchaku2 = readPositiveInt(buffer, 190, 7, 1000);
    const touroku = readInt(buffer, 324, 2);
    const shusso = readInt(buffer, 327, 2);
    if (touroku !== null && shusso !== null && 0 < shusso) {
      toBe.TorikeshiTousuu = touroku - shusso;
    }
    toBe.Baba = $R.baba.toCodeFromJravan(buffer, 331, 1);
    toBe.Tenki = $R.tenki.toCodeFromJravan(buffer, 332, 1);
    upsert(RaceSeiseki, toBe);
  }

  protected async saveRaceLapTime(buffer: Buffer, race: Race) {
    if (race.HeichiShougai === $R.HeichiShougai.Heichi) {
      await jravanRaceTool.saveRaceLapTime(buffer, 649, race);
      return;
    }
    // 障害: 1 マイル通過タイム (分と秒)、後 4 ハロン、後 3 ハロン
    await jravanRaceTool.saveShougaiLapTime(
      race,
      readInt(buffer, 649, 3),
      readPositiveInt(buffer, 652, 3, 0.1),
      readPositiveInt(buffer, 655, 3, 0.1),
      readPositiveInt(buffer, 658, 3, 0.1),
    );
  }

  /** 払戻金の読み取り位置 (単勝・複勝・枠連・馬連・ワイド) */
  public static haitouInfos(): HaitouInfo[] {
    const infos: HaitouInfo[] = [];
    // 馬番(2) 払戻金(7) 人気順(2)
    for (let i = 0; i < 3; i++) {
      const o = 333 + i * 11;
      infos.push({
        baken: Baken.Tanshou,
        index: i + 1,
        bangou1: o,
        bangou1Len: 2,
        haitou: o + 2,
        haitouLen: 7,
        ninki: o + 9,
        ninkiLen: 2,
      });
    }
    for (let i = 0; i < 5; i++) {
      const o = 366 + i * 11;
      infos.push({
        baken: Baken.Fukushou,
        index: i + 1,
        bangou1: o,
        bangou1Len: 2,
        haitou: o + 2,
        haitouLen: 7,
        ninki: o + 9,
        ninkiLen: 2,
      });
    }
    // 枠番1・2 (1+1) 払戻金(7) 人気順(2)
    for (let i = 0; i < 3; i++) {
      const o = 421 + i * 11;
      infos.push({
        baken: Baken.Wakuren,
        index: i + 1,
        bangou1: o,
        bangou1Len: 1,
        bangou2: o + 1,
        bangou2Len: 1,
        haitou: o + 2,
        haitouLen: 7,
        ninki: o + 9,
        ninkiLen: 2,
      });
    }
    // 馬番1・2 (2+2) 払戻金(8) 人気順(3)
    for (let i = 0; i < 3; i++) {
      const o = 454 + i * 15;
      infos.push({
        baken: Baken.Umaren,
        index: i + 1,
        bangou1: o,
        bangou1Len: 2,
        bangou2: o + 2,
        bangou2Len: 2,
        haitou: o + 4,
        haitouLen: 8,
        ninki: o + 12,
        ninkiLen: 3,
      });
    }
    for (let i = 0; i < 7; i++) {
      const o = 499 + i * 15;
      infos.push({
        baken: Baken.Wide,
        index: i + 1,
        bangou1: o,
        bangou1Len: 2,
        bangou2: o + 2,
        bangou2Len: 2,
        haitou: o + 4,
        haitouLen: 8,
        ninki: o + 12,
        ninkiLen: 3,
      });
    }
    return infos;
  }
}
