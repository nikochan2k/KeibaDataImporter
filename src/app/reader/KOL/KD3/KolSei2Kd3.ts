import { Service, Inject } from "typedi";
import { readInt, readPositiveInt, readDate, readStrWithNoSpace, readDouble, readTime } from "../../Reader";
import { ShussoubaTool } from "../../ShussoubaTool";
import { DataToImport } from "../../DataToImport";
import { KolTool } from "../KolTool";
import { KolChoukyouTool, FurlongOffset } from "../KolChoukyouTool";
import { Kishu } from "../../../entities/Kishu";
import { Shussouba } from "../../../entities/Shussouba";
import { ShussoubaYosou } from "../../../entities/ShussoubaYosou";
import { ShussoubaTsuukaJuni } from "../../../entities/ShussoubaTsuukaJuni";
import * as $C from "../../../converters/Common";
import * as $S from "../../../converters/Shussouba";
import * as $SF from "../../../converters/ShussoubaYosou";
import * as $KI from "../../../converters/Kishu";

const courseFurlongOffsets: FurlongOffset[] = [
  { f: 8, offset: 27 },
  { f: 7, offset: 33 },
  { f: 6, offset: 39 },
  { f: 5, offset: 45 },
  { f: 4, offset: 51 },
  { f: 3, offset: 57 },
  { f: 1, offset: 63 }
];

const hanroFurlongOffsets: FurlongOffset[] = [
  { f: 4, offset: 45 },
  { f: 3, offset: 51 },
  { f: 2, offset: 57 },
  { f: 1, offset: 63 }
];

@Service()
export class KolSei2Kd3 extends DataToImport {

  @Inject()
  private shussoubaTool: ShussoubaTool;

  @Inject()
  private choukyouTool: KolChoukyouTool;

  @Inject()
  private kolTool: KolTool;

  protected getBufferLength() {
    return 600;
  }

  protected async save(buffer: Buffer) {
    const raceId = this.kolTool.getRaceId(buffer);
    const race = await this.shussoubaTool.getRace(raceId);
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
    await this.choukyouTool.saveChoukyou(buffer, shussouba, 307, hanroFurlongOffsets, courseFurlongOffsets);
  }

  public async finishUp() {
    this.shussoubaTool.finishUp();
  }

  protected async saveKishu(buffer: Buffer, shussouba: Shussouba) {
    let kishu = new Kishu();
    kishu.KolKishuCode = readInt(buffer, 162, 5);
    kishu.KishuMei = readStrWithNoSpace(buffer, 167, 32);
    kishu.TanshukuKishuMei = readStrWithNoSpace(buffer, 199, 8);
    kishu.MasshouFlag = $KI.MasshouFlag.Geneki;
    kishu.TouzaiBetsu = $C.touzaiBetsu.toCodeFromKol(buffer, 207, 1);
    kishu.ShozokuBasho = $C.basho.toCodeFromKol(buffer, 208, 2);
    const kyuushaCode = readPositiveInt(buffer, 210, 5);
    if (kyuushaCode) {
      const kyuusha = await this.kolTool.getKyuushaWith(kyuushaCode);
      if (!kyuusha.Id) {
        this.entityManager.persist(kyuusha);
      }
      kishu.Kyuusha = kyuusha;
    }
    kishu.MinaraiKubun = $KI.minaraiKubun.toCodeFromKol(buffer, 215, 1);
    kishu.FromNengappi = shussouba.Race.Nengappi;
    kishu.ToNengappi = shussouba.Race.Nengappi;
    kishu = await this.tool.saveKishu(kishu);
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
    shussouba.Kyousouba = await this.kolTool.saveUma(buffer, { meishou: 34, umaKigou: 64, seibetsu: 66, },
      { meishou: 69, tanshuku: 109 });
    shussouba.Nenrei = readPositiveInt(buffer, 67, 2);
    shussouba.Blinker = $S.blinker.toCodeFromKol(buffer, 149, 1);
    shussouba.Kinryou = readDouble(buffer, 150, 3, 0.1);
    shussouba.Bataijuu = readPositiveInt(buffer, 153, 3);
    shussouba.Zougen = readInt(buffer, 156, 3);
    shussouba.Kyuusha = await this.kolTool.saveKyuusha(buffer, {
      kolKyuushaCode: 217, meishou: 222, tanshuku: 254, shozokuBasho: 262, ritsuHokuNanBetsu: 264
    });
    shussouba.Kishu = await this.saveKishu(buffer, shussouba);
    shussouba.Norikawari = $S.norikawari.toCodeFromKol(buffer, 215, 1);
    shussouba.Ninki = readPositiveInt(buffer, 267, 2);
    shussouba.Odds = readDouble(buffer, 269, 5, 0.1);
    shussouba.KakuteiChakujun = this.shussoubaTool.getChakujun(buffer, 274, 2);
    shussouba.ChakujunFuka = $S.chakujunFuka.toCodeFromKol(buffer, 276, 2);
    shussouba.NyuusenChakujun = this.shussoubaTool.getChakujun(buffer, 278, 2);
    shussouba.TorikeshiShubetsu = $S.torikeshiShubetsu.toCodeFromKol(buffer, 280, 1);
    shussouba.RecordNinshiki = $S.recordNinshiki.toCodeFromKol(buffer, 281, 1);
    shussouba.Time = readTime(buffer, 282, 4);
    shussouba.Chakusa1 = readInt(buffer, 286, 2);
    shussouba.Chakusa2 = $S.chakura2.toCodeFromKol(buffer, 288, 1);
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
    shussouba.YonCornerIchiDori = $S.yonCornerIchiDori.toCodeFromKol(buffer, 306, 1);
    await this.entityManager.persist(shussouba);
  }

  protected async saveShussoubaYosou(buffer: Buffer, shussouba: Shussouba) {
    const shussoubaYosou = new ShussoubaYosou();
    shussoubaYosou.Shussouba = shussouba;
    shussoubaYosou.KolRecordShisuu = readInt(buffer, 159, 3);
    shussoubaYosou.KolYosou1 = $SF.yosou.toCodeFromKol(buffer, 265, 1);
    shussoubaYosou.KolYosou2 = $SF.yosou.toCodeFromKol(buffer, 266, 1);
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