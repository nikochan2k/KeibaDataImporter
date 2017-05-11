import { EntityManager } from "typeorm";
import {
  readInt, readPositiveInt, readDate, readRaw, readStr, readStrWithNoSpace, readDouble, readTime
} from "../../ReadTool";
import { DataReader } from "../../DataReader";
import { Race } from "../../../entities/Race";
import { Shussouba } from "../../../entities/Shussouba";
import { ShussoubaFuka } from "../../../entities/ShussoubaFuka";
import { Uma } from "../../../entities/Uma";
import { Banushi } from "../../../entities/Banushi";
import * as $S from "../../../converters/Shussouba";
import * as $SF from "../../../converters/ShussoubaFuka";
import * as $U from "../../../converters/Uma";

export class KolSei1Kd3 extends DataReader {

  constructor(entityManager: EntityManager, fd: number) {
    super(entityManager, fd);
  }

  protected getBufferLength() {
    return 600;
  }

  protected async save(buffer: Buffer) {
    const raceId = readPositiveInt(buffer, 0, 12);
    const race = await this.entityManager.findOneById(Race, raceId);
    if (race === null) {
      return;
    }
    const umaban = readPositiveInt(buffer, 23, 2);
    if (umaban === null) {
      return null;
    }
    const id = race.Id * 100 + umaban;
    let shussouba = await this.entityManager.findOneById(Shussouba, id);
    const dataSakuseiNengappi = readDate(buffer, 424, 8);
    if (shussouba) {
      if (dataSakuseiNengappi <= race.KolSeisekiSakuseiNengappi) {
        return;
      }
    } else {
      shussouba = new Shussouba();
      shussouba.Id = id;
    }
    shussouba.Race = race;
    shussouba.Umaban = umaban;
    shussouba.KolSeisekiSakuseiNengappi = dataSakuseiNengappi;

    this.saveShussouba(buffer, shussouba);
    this.saveShussoubaYosou(buffer, shussouba);
  }

  protected async getBanushi(banushiMei: string) {
    let banushi = await this.entityManager
      .getRepository(Banushi)
      .createQueryBuilder("b")
      .where("b.BanushiMei = :banushiMei")
      .orWhere("b.BanushiMei = :banushiMei")
      .setParameter("banushiMei", banushiMei)
      .getOne();
    if (!banushi) {
      banushi = new Banushi();
      banushi.BanushiMei = banushiMei;
    }
    return banushi;
  }

  protected async getUma(bamei: string) {
    let uma = await this.entityManager
      .getRepository(Uma)
      .createQueryBuilder("u")
      .where("u.KanaBamei = :bamei")
      .orWhere("u.KyuuBamei = :bamei")
      .setParameter("bamei", bamei)
      .getOne();
    if (!uma) {
      uma = new Uma();
      uma.KanaBamei = bamei;
    }
    return uma;
  }

  protected async saveBanushi(buffer: Buffer) {
    const banushiMei = readStrWithNoSpace(buffer, 69, 40);
    const banushi = await this.getBanushi(banushiMei);
    if (banushi.Id) {
      return banushi;
    }
    banushi.TanshukuBanushiMei = readStrWithNoSpace(buffer, 109, 20);
    return await this.entityManager.persist(banushi);
  }

  protected async saveKyousouba(buffer: Buffer) {
    const bamei = readStrWithNoSpace(buffer, 34, 30);
    const uma = await this.getUma(bamei);
    if (uma.Id) {
      return uma;
    }
    uma.UmaKigou = $U.umaKigou.toCodeFromKol(readRaw(buffer, 34, 30));
    uma.Seibetsu = $U.seibetsu.toCodeFromKol(readRaw(buffer, 66, 1));
    uma.Banushi = await this.saveBanushi(buffer);
    return uma;
  }

  protected async normalizeNenrei(shussouba: Shussouba) {
    if (shussouba.Race.KaisaiNen <= 2000) {
      shussouba.Nenrei--;
    }
  }

  protected getChakujun(buffer, offset, length) {
    const chakujun = readInt(buffer, offset, length);
    if (1 <= chakujun && chakujun <= 28) {
      return chakujun;
    }
    return null;
  }

  protected getTimeSa(buffer: Buffer, offset: number) {
    const timeSa = readDouble(buffer, offset, 3, 0.1);
    if (99.8 <= timeSa) {
      return 0.0;
    }
    return timeSa;
  }

  protected async saveShussouba(buffer: Buffer, shussouba: Shussouba) {
    shussouba.Wakuban = readPositiveInt(buffer, 22, 1);
    shussouba.Gate = readPositiveInt(buffer, 25, 2);
    shussouba.Kyousouba = await this.saveKyousouba(buffer);
    shussouba.Nenrei = readPositiveInt(buffer, 67, 2);
    shussouba.Blinker = $S.blinker.toCodeFromKol(readRaw(buffer, 149, 1));
    shussouba.Kinryou = readDouble(buffer, 150, 3, 0.1);
    shussouba.Bataijuu = readPositiveInt(buffer, 153, 3);
    shussouba.Zougen = readInt(buffer, 156, 3);
    shussouba.Ninki = readPositiveInt(buffer, 267, 2);
    shussouba.Odds = readDouble(buffer, 269, 5, 0.1);
    shussouba.KakuteiChakujun = this.getChakujun(buffer, 274, 2);
    shussouba.ChakujunFuka = $S.chakujunFuka.toCodeFromKol(readRaw(buffer, 276, 2));
    shussouba.NyuusenChakujun = this.getChakujun(buffer, 278, 2);
    shussouba.TorikeshiShubetsu = $S.torikeshiShubetsu.toCodeFromKol(readRaw(buffer, 280, 1));
    shussouba.RecordNinshiki = $S.recordNinshiki.toCodeFromKol(readRaw(buffer, 281, 1));
    shussouba.Time = readTime(buffer, 282, 4);
    shussouba.Chakusa1 = readInt(buffer, 286, 2);
    shussouba.Chakusa2 = $S.chakura2.toCodeFromKol(readRaw(buffer, 288, 1));
    shussouba.TimeSa = this.getTimeSa(buffer, 289);
    if (1200 <= shussouba.Race.Kyori) {
      shussouba.Ten3F = readDouble(buffer, 292, 3);
    }
    shussouba.Agari3F = readDouble(buffer, 295, 3);
    shussouba.YonCornerIchiDori = $S.yonCornerIchiDori.toCodeFromKol(readRaw(buffer, 306, 1));
    this.entityManager.persist(shussouba);
  }

  protected async saveShussoubaYosou(buffer: Buffer, shussouba: Shussouba) {
    const shussoubaFuka = new ShussoubaFuka();
    shussoubaFuka.Shussouba = shussouba;
    shussoubaFuka.KolRecordShisuu = readInt(buffer, 159, 3);
    shussoubaFuka.KolYosou1 = $SF.yosou.toCodeFromKol(readRaw(buffer, 265, 1));
    shussoubaFuka.KolYosou2 = $SF.yosou.toCodeFromKol(readRaw(buffer, 266, 1));
    this.entityManager.persist(shussoubaFuka);
  }

}