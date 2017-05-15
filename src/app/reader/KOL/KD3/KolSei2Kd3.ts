import { EntityManager } from "typeorm";
import {
  readInt, readPositiveInt, readDate, readRaw, readStrWithNoSpace, readDouble, readTime
} from "../../ReadTool";
import { KolShussoubaReader } from "../KolShussoubaReader";
import { Shussouba } from "../../../entities/Shussouba";
import { ShussoubaYosou } from "../../../entities/ShussoubaYosou";
import { ShussoubaTsuukaJuni } from "../../../entities/ShussoubaTsuukaJuni";
import * as $C from "../../../converters/Common";
import * as $S from "../../../converters/Shussouba";
import * as $SF from "../../../converters/ShussoubaYosou";
import * as $KI from "../../../converters/Kishu";
import * as $KY from "../../../converters/Kyuusha";
import * as $U from "../../../converters/Uma";

export class KolSei2Kd3 extends KolShussoubaReader {

  constructor(entityManager: EntityManager, fd: number) {
    super(entityManager, fd);
  }

  protected getBufferLength() {
    return 600;
  }

  protected async save(buffer: Buffer) {
    const raceId = readPositiveInt(buffer, 0, 12);
    const race = await this.getRace(raceId);
    if (race === null) {
      return;
    }
    const umaban = readPositiveInt(buffer, 23, 2);
    if (umaban === null) {
      this.logger.warn("馬番がありません");
      return null;
    }
    const id = race.Id * 100 + umaban;
    let shussouba = await this.entityManager.findOneById(Shussouba, id);
    const dataSakuseiNengappi = readDate(buffer, 424, 8);
    if (shussouba) {
      if (dataSakuseiNengappi <= shussouba.KolSeisekiSakuseiNengappi) {
        this.logger.debug("既に最新の出走馬成績データが格納されています: " + id);
        return;
      }
    } else {
      shussouba = new Shussouba();
      shussouba.Id = id;
    }
    shussouba.Race = race;
    shussouba.Umaban = umaban;
    shussouba.KolSeisekiSakuseiNengappi = dataSakuseiNengappi;

    await this.saveShussouba(buffer, shussouba);
    race.ShussoubaList.push(shussouba);
    await this.saveShussoubaYosou(buffer, shussouba);
    await this.saveShussoubaTsuukaJuni(buffer, shussouba);
  }

  protected getBanushiMei(buffer, offset, length) {
    let banushiMei = readStrWithNoSpace(buffer, offset, length);
    if (!banushiMei) {
      return banushiMei;
    }
    banushiMei = banushiMei.replace(/・/g, "");
    banushiMei = banushiMei.replace(/㈱/g, "株式会社");
    banushiMei = banushiMei.replace(/㈲/g, "有限会社");
    banushiMei = banushiMei.replace(/氏$/, "");
    return banushiMei;
  }

  protected async saveBanushi(buffer: Buffer) {
    const banushiMei = this.getBanushiMei(buffer, 69, 40);
    const banushi = await this.getBanushi(banushiMei);
    if (!banushi.Id) {
      banushi.TanshukuBanushiMei = readStrWithNoSpace(buffer, 109, 20);
      await this.entityManager.persist(banushi);
    }
    return banushi;
  }

  protected async saveUma(buffer: Buffer) {
    const bamei = readStrWithNoSpace(buffer, 34, 30);
    const uma = await this.getUma(bamei);
    if (!uma.Id) {
      uma.UmaKigou = $U.umaKigou.toCodeFromKol(readRaw(buffer, 64, 2));
      uma.Seibetsu = $U.seibetsu.toCodeFromKol(readRaw(buffer, 66, 1));
      uma.Banushi = await this.saveBanushi(buffer);
      await this.entityManager.persist(uma);
    }
    return uma;
  }

  protected async saveKyuusha(buffer: Buffer) {
    const kyuushaMei = readStrWithNoSpace(buffer, 222, 32);
    const kyuusha = await this.getKyuusha(kyuushaMei);
    if (!kyuusha.Id) {
      kyuusha.KolKyuushaCode = readInt(buffer, 217, 5);
      kyuusha.TanshukuKyuushaMei = readStrWithNoSpace(buffer, 254, 8);
      kyuusha.ShozokuBasho = $C.basho.toCodeFromKol(readRaw(buffer, 262, 2));
      kyuusha.RitsuHokuNanBetsu = $KY.ritsuHokuNanBetsu.toCodeFromKol(readRaw(buffer, 264, 1));
      await this.entityManager.persist(kyuusha);
    }
    return kyuusha;
  }

  protected async saveKishu(buffer: Buffer) {
    const kishuMei = readStrWithNoSpace(buffer, 167, 32);
    const kishu = await this.getKishu(kishuMei);
    if (!kishu.Id) {
      kishu.KolKishuCode = readInt(buffer, 162, 5);
      kishu.TanshukuKishuMei = readStrWithNoSpace(buffer, 199, 8);
      kishu.TouzaiBetsu = $C.touzaiBetsu.toCodeFromKol(readRaw(buffer, 207, 1));
      kishu.ShozokuBasho = $C.basho.toCodeFromKol(readRaw(buffer, 208, 2));
      kishu.Kyuusha = await this.getKyuushaByCode(readInt(buffer, 210, 5));
      kishu.MinaraiKubun = $KI.minaraiKubun.toCodeFromKol(readRaw(buffer, 215, 1));
      await this.entityManager.persist(kishu);
    }
    return kishu;
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
    shussouba.Kyousouba = await this.saveUma(buffer);
    shussouba.Nenrei = readPositiveInt(buffer, 67, 2);
    shussouba.Blinker = $S.blinker.toCodeFromKol(readRaw(buffer, 149, 1));
    shussouba.Kinryou = readDouble(buffer, 150, 3, 0.1);
    shussouba.Bataijuu = readPositiveInt(buffer, 153, 3);
    shussouba.Zougen = readInt(buffer, 156, 3);
    shussouba.Kyuusha = await this.saveKyuusha(buffer);
    shussouba.Kishu = await this.saveKishu(buffer);
    shussouba.Norikawari = $S.norikawari.toCodeFromKol(readRaw(buffer, 215, 1));
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
      shussouba.Ten3F = readDouble(buffer, 292, 3, 0.1);
      if (shussouba.Time && shussouba.Ten3F) {
        shussouba.Ten3FIkou = shussouba.Time - shussouba.Ten3F;
      }
    }
    shussouba.Agari3F = readDouble(buffer, 295, 3, 0.1);
    if (shussouba.Time && shussouba.Agari3F) {
      shussouba.Agari3FIzen = shussouba.Time - shussouba.Agari3F;
    }
    if (1200 < shussouba.Race.Kyori && shussouba.Ten3F && shussouba.Agari3F) {
      shussouba.Chuukan = shussouba.Time - shussouba.Ten3F - shussouba.Agari3F;
    }
    shussouba.YonCornerIchiDori = $S.yonCornerIchiDori.toCodeFromKol(readRaw(buffer, 306, 1));
    await this.entityManager.persist(shussouba);
  }

  protected async saveShussoubaYosou(buffer: Buffer, shussouba: Shussouba) {
    const shussoubaYosou = new ShussoubaYosou();
    shussoubaYosou.Shussouba = shussouba;
    shussoubaYosou.KolRecordShisuu = readInt(buffer, 159, 3);
    shussoubaYosou.KolYosou1 = $SF.yosou.toCodeFromKol(readRaw(buffer, 265, 1));
    shussoubaYosou.KolYosou2 = $SF.yosou.toCodeFromKol(readRaw(buffer, 266, 1));
    await this.entityManager.persist(shussoubaYosou);
  }

  protected async saveShussoubaTsuukaJuni(buffer: Buffer, shussouba: Shussouba) {
    for (let bangou = 1, offset = 298; bangou <= 4; bangou++ , offset += 2) {
      const shussoubaTsuukaJuni = new ShussoubaTsuukaJuni();

      const juni = readPositiveInt(buffer, offset, 2);
      if (juni === null) {
        continue;
      }
      if (1 <= juni && juni <= 28) {
        shussoubaTsuukaJuni.Juni = juni;
      } else if (juni === 31 || juni === 32) {
        shussoubaTsuukaJuni.Joukyou = juni;
      } else if (41 <= juni && juni <= 68) {
        shussoubaTsuukaJuni.Juni = juni - 40;
        shussoubaTsuukaJuni.Joukyou = 40;
      } else {
        this.logger.warn("不正な順位: " + juni);
        continue;
      }

      shussoubaTsuukaJuni.Id = shussouba.Id * 10 + bangou;
      shussoubaTsuukaJuni.Shussouba = shussouba;
      shussoubaTsuukaJuni.Bangou = bangou;
      await this.entityManager.persist(shussoubaTsuukaJuni);
    }
  }

}