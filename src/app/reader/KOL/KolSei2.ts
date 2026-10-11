import * as $C from "../../converters/Common";
import * as $K from "../../converters/Kishu";
import * as $S from "../../converters/Shussouba";
import { Bagu } from "../../converters/ShussoubaJoutai";
import * as $SY from "../../converters/ShussoubaYosou";
import { Kyousouba } from "../../entities/Kyousouba";
import { Shussouba } from "../../entities/Shussouba";
import { ShussoubaHyouka } from "../../entities/ShussoubaHyouka";
import { Kubun } from "../../entities/ShussoubaJoutai";
import { ShussoubaSeiseki } from "../../entities/ShussoubaSeiseki";
import { ShussoubaYosou } from "../../entities/ShussoubaYosou";
import { Uma } from "../../entities/Uma";
import { DataToImport } from "../DataToImport";
import {
  readInt,
  readPositiveDouble,
  readPositiveInt,
  readStrWithNoSpace,
  readTime,
} from "../Reader";
import { ShussoubaInfo } from "../ShussoubaTool";
import { tool } from "../Tool";
import { kolChoukyouTool } from "./KolChoukyouTool";
import { kolOddsHaitouTool } from "./KolOddsHaitouTool";
import { kolShussoubaTool } from "./KolShussoubaTool";
import { kolTool } from "./KolTool";

export class KolSei2 extends DataToImport {
  protected getBufferLength() {
    return 600;
  }

  public async save(buffer: Buffer) {
    const rsId = kolShussoubaTool.getRaceShussoubaId(buffer, 23);
    if (!rsId) {
      return;
    }
    const dataNenggapi = readInt(buffer, 424, 8);

    const shussoubaSeiseki = await this.entityManager.findOneBy(ShussoubaSeiseki, {
      Id: rsId.shussoubaId,
    });
    if (shussoubaSeiseki?.KolNengappi && dataNenggapi <= shussoubaSeiseki.KolNengappi) {
      return;
    }

    const info = await kolShussoubaTool.getShussoubaInfo(buffer, 23);
    if (!info) {
      return;
    }
    // TODO
    if (!info.shussouba) {
      info.shussouba = await this.saveShussouba(buffer, info);
      if (!info.shussouba) {
        return;
      }
    } else {
      const kyousouba = await this.entityManager.findOneBy(Kyousouba, {
        Id: info.shussouba.KyousoubaId,
      });
      info.uma = new Uma();
      info.uma.Id = kyousouba.UmaId;
    }

    await this.saveShussoubaJoutai(buffer, info.shussouba);
    await this.saveShussoubaSeiseki(buffer, info, shussoubaSeiseki, dataNenggapi);
    await this.saveShussoubaHyouka(buffer, info.shussouba);
    await this.saveShussoubaYosou(buffer, info.shussouba);
    await kolOddsHaitouTool.saveKakuteiNinkiOdds(buffer, info.shussouba, 267, 269);
    await kolShussoubaTool.saveShussoubaTsuukaJuni(buffer, 298, info.shussouba);
    await this.saveChoukyou(buffer, info);
  }

  protected async saveShussouba(buffer: Buffer, info: ShussoubaInfo) {
    let toBe = kolShussoubaTool.createShussouba(buffer, 23);
    if (!toBe) {
      return null;
    }
    toBe.Wakuban = readPositiveInt(buffer, 22, 1);
    const choukyoushi = await kolTool.saveChoukyoushi(buffer, 217);
    const umaInfo = await kolTool.saveKyousouba(buffer, 27, choukyoushi);
    info.uma = umaInfo.Uma;
    toBe.KyousoubaId = umaInfo.Kyousouba.Id;
    const nenrei = readPositiveInt(buffer, 67, 2);
    const nen = readInt(buffer, 2, 4);
    toBe.Nenrei = tool.normalizeNenrei(nenrei, nen);

    toBe = await tool.saveOrUpdate(Shussouba, info.shussouba, toBe);
    await kolTool.saveBanushi(buffer, 69, toBe.Id);
    return toBe;
  }

  protected async saveShussoubaJoutai(buffer: Buffer, shussouba: Shussouba) {
    const blinker = readPositiveInt(buffer, 149, 1);
    if (0 < blinker) {
      await kolShussoubaTool.saveShussoubaJoutai(shussouba.Id, Kubun.Bagu, Bagu.Blinker);
    }
  }

  protected async saveShussoubaSeiseki(
    buffer: Buffer,
    info: ShussoubaInfo,
    asIs: ShussoubaSeiseki,
    dataNengappi: number,
  ) {
    const toBe = new ShussoubaSeiseki();
    toBe.Id = info.shussouba.Id;
    toBe.Gate = readPositiveInt(buffer, 25, 2);
    toBe.Kinryou = readPositiveDouble(buffer, 150, 3, 0.1);
    toBe.Bataijuu = readPositiveInt(buffer, 153, 3);
    toBe.Zougen = readInt(buffer, 156, 3);
    const kishu = await kolTool.saveKishu(buffer, 162);
    toBe.KishuId = kishu.Id;
    toBe.KishuTouzaiBetsu = $C.touzaiBetsu.toCodeFromKol(buffer, 207, 1);
    toBe.KishuShozokuBasho = $C.basho.toCodeFromKol(buffer, 208, 2);
    toBe.KishuShozokuChoukyoushiId = await kolTool.saveShozokuChoukyoushi(buffer, 210);
    toBe.MinaraiKubun = $K.minaraiKubun.toCodeFromKol(buffer, 215, 1);
    toBe.Norikawari = $S.norikawari.toCodeFromKol(buffer, 216, 1);
    toBe.KakuteiChakujun = tool.getChakujun(buffer, 274, 2);
    toBe.ChakujunFuka = $S.chakujunFuka.toCodeFromKol(buffer, 276, 2);
    toBe.NyuusenChakujun = tool.getChakujun(buffer, 278, 2);
    toBe.TorikeshiShubetsu = $S.torikeshiShubetsu.toCodeFromKol(buffer, 280, 1);
    toBe.RecordNinshiki = $S.recordNinshiki.toCodeFromKol(buffer, 281, 1);
    toBe.Time = readTime(buffer, 282, 4);
    toBe.Chakusa1 = readInt(buffer, 286, 2);
    toBe.Chakusa2 = $S.chakura2.toCodeFromKol(buffer, 288, 1);
    toBe.TimeSa = kolShussoubaTool.getTimeSa(buffer, 289);
    if (1200 <= info.race.Kyori) {
      toBe.Ten3F = readPositiveDouble(buffer, 292, 3, 0.1);
      if (toBe.Time && toBe.Ten3F) {
        toBe.Ten3FIkou = toBe.Time - toBe.Ten3F;
      }
    }
    toBe.Agari3F = readPositiveDouble(buffer, 295, 3, 0.1);
    if (toBe.Time && toBe.Agari3F) {
      toBe.Agari3FIzen = toBe.Time - toBe.Agari3F;
    }
    if (1200 < info.race.Kyori && toBe.Ten3F && toBe.Agari3F) {
      toBe.Douchuu = toBe.Time - toBe.Ten3F - toBe.Agari3F;
    }
    toBe.YonCornerIchiDori = $S.ichi.toCodeFromKol(buffer, 306, 1);
    toBe.KolNengappi = dataNengappi;

    return await tool.saveOrUpdate(ShussoubaSeiseki, asIs, toBe);
  }

  protected async saveShussoubaYosou(buffer: Buffer, shussouba: Shussouba) {
    const toBe = new ShussoubaYosou();
    toBe.Id = shussouba.Id;
    toBe.KolYosou1 = $SY.shirushi.toCodeFromKol(buffer, 265, 1);
    toBe.KolYosou2 = $SY.shirushi.toCodeFromKol(buffer, 266, 1);

    const asIs = await this.entityManager.findOneBy(ShussoubaYosou, { Id: shussouba.Id });

    return await tool.saveOrUpdate(ShussoubaYosou, asIs, toBe);
  }

  protected async saveShussoubaHyouka(buffer: Buffer, shussouba: Shussouba) {
    const toBe = new ShussoubaHyouka();
    toBe.Id = shussouba.Id;
    toBe.KolRecordShisuu = readInt(buffer, 159, 3);

    const asIs = await this.entityManager.findOneBy(ShussoubaHyouka, { Id: shussouba.Id });

    return await tool.saveOrUpdate(ShussoubaHyouka, asIs, toBe);
  }

  protected async saveChoukyou(buffer: Buffer, info: ShussoubaInfo) {
    const tanshukuKishuMei = readStrWithNoSpace(buffer, 199, 8);
    await kolChoukyouTool.saveChoukyou(
      buffer,
      307,
      info.shussouba.Id,
      info.uma.Id,
      tanshukuKishuMei,
    );
  }
}
