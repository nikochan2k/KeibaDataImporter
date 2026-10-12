import * as $C from "../../converters/Common";
import * as $K from "../../converters/Kishu";
import * as $R from "../../converters/Race";
import * as $S from "../../converters/Shussouba";
import * as $SY from "../../converters/ShussoubaYosou";
import { findOneBy, upsertLater } from "../../db/helpers";
import { Race } from "../../entities/Race";
import { RaceSeiseki } from "../../entities/RaceSeiseki";
import { Shussouba } from "../../entities/Shussouba";
import { ShussoubaHyouka } from "../../entities/ShussoubaHyouka";
import { ShussoubaSeiseki } from "../../entities/ShussoubaSeiseki";
import { ShussoubaYosou } from "../../entities/ShussoubaYosou";
import {
  readDouble,
  readJikan,
  readPositiveDouble,
  readPositiveInt,
  readSignedInt,
} from "../Reader";
import { tool } from "../Tool";
import { JrdbData } from "./JrdbData";
import { jrdbOddsHaitouTool } from "./JrdbOddsHaitouTool";
import { jrdbShussoubaTool } from "./JrdbShussoubaTool";

export class Tyb extends JrdbData {
  protected getBufferLength() {
    return 128;
  }

  public async save(buffer: Buffer) {
    const shussouba = await jrdbShussoubaTool.getShussouba(buffer, 8);
    if (!shussouba) {
      this.logger.warn("出走馬が見つかりません。");
      return;
    }
    await this.saveRaceInfo(buffer, shussouba.RaceId);
    await this.saveShussoubaYosou(buffer, shussouba.Id);
    await this.saveShussoubaHyouka(buffer, shussouba.Id);
    await this.saveOddsHaitou(buffer, shussouba);
    await this.saveShussoubaSeiseki(buffer, shussouba.Id);
  }

  /**
   * レース単位の情報(馬場状態、天候、発走時間)を保存します。
   * 直前情報は出走馬ごとの行に同じ値が入っているので、何度書いても同じになります。
   */
  protected async saveRaceInfo(buffer: Buffer, raceId: number) {
    const race = await findOneBy(Race, { Id: raceId });
    if (race) {
      const toBe = {} as Race;
      toBe.HassouJikan = readJikan(buffer, 99);
      await tool.saveOrUpdate(Race, race, toBe, true);
    }

    const seiseki = {} as RaceSeiseki;
    seiseki.Id = raceId;
    seiseki.Baba = $R.baba.toCodeFromJrdb(buffer, 69, 1);
    seiseki.BabaSokudo = $R.babaSokudo.toCodeFromJrdb(buffer, 70, 1);
    seiseki.Tenki = $R.tenki.toCodeFromJrdb(buffer, 71, 1);
    upsertLater(RaceSeiseki, seiseki, true);
  }

  protected async saveShussoubaHyouka(buffer: Buffer, shussoubaId: number) {
    const toBe = {} as ShussoubaHyouka;
    toBe.Id = shussoubaId;
    toBe.BataiCode = $S.bataiCode.toCodeFromJrdb(buffer, 97, 1);
    toBe.KehaiCode = $S.kehaiCode.toCodeFromJrdb(buffer, 98, 1);
    upsertLater(ShussoubaHyouka, toBe, true);
  }

  protected async saveShussoubaYosou(buffer: Buffer, shussoubaId: number) {
    const toBe = {} as ShussoubaYosou;
    toBe.Id = shussoubaId;
    toBe.Idm = readDouble(buffer, 10, 5);
    toBe.KishuShisuu = readDouble(buffer, 15, 5);
    toBe.JouhouShisuu = readDouble(buffer, 20, 5);
    toBe.OddsShisuu = readDouble(buffer, 25, 5);
    toBe.PaddockShisuu = readDouble(buffer, 30, 5);
    toBe.SougouShisuu = readDouble(buffer, 40, 5);
    toBe.BaguHenkouJouhou = $SY.baguHenkouJouhou.toCodeFromJrdb(buffer, 45, 1);
    toBe.Ashimoto = $SY.ashimotoJouhou.toCodeFromJrdb(buffer, 46, 1);
    toBe.OddsShirushi = $SY.shirushi.toCodeFromJrdb(buffer, 94, 1);
    toBe.PaddockShirushi = $SY.shirushi.toCodeFromJrdb(buffer, 95, 1);
    toBe.ChokuzenSougouShirushi = $SY.shirushi.toCodeFromJrdb(buffer, 96, 1);

    upsertLater(ShussoubaYosou, toBe);
  }

  protected async saveOddsHaitou(buffer: Buffer, shussouba: Shussouba) {
    await jrdbOddsHaitouTool.saveOddsNinki(buffer, shussouba, {
      Kakutei: $C.Kakutei.Chokuzen,
      Baken: $C.Baken.Tanshou,
      OddsOffset: 72,
      OddsLength: 6,
      JikanOffset: 84,
    });
    await jrdbOddsHaitouTool.saveOddsNinki(buffer, shussouba, {
      Kakutei: $C.Kakutei.Chokuzen,
      Baken: $C.Baken.Fukushou,
      OddsOffset: 78,
      OddsLength: 6,
      JikanOffset: 84,
    });
  }

  protected async saveShussoubaSeiseki(buffer: Buffer, shussoubaId: number) {
    const toBe = {} as ShussoubaSeiseki;
    toBe.Id = shussoubaId;
    toBe.TorikeshiShubetsu = $S.torikeshiShubetsu.toCodeFromJrdb(buffer, 47, 1);
    toBe.Kinryou = readPositiveDouble(buffer, 65, 3, 0.1);
    toBe.MinaraiKubun = $K.minaraiKubun.toCodeFromJrdb(buffer, 68, 1);
    const kishu = await jrdbShussoubaTool.saveKishu(buffer, 48, 53);
    toBe.KishuId = kishu ? kishu.Id : null;
    toBe.Bataijuu = readPositiveInt(buffer, 88, 3);
    toBe.Zougen = readSignedInt(buffer, 91, 3);

    upsertLater(ShussoubaSeiseki, toBe);
  }
}
