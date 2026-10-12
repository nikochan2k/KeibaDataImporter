import * as $C from "../../converters/Common";
import * as $R from "../../converters/Race";
import * as $S from "../../converters/Shussouba";
import { choukyoushiDao } from "../../daos/ChoukyoushiDao";
import { umaDao } from "../../daos/UmaDao";
import { query, save, updateBy, upsertLater } from "../../db/helpers";
import { Choukyoushi } from "../../entities/Choukyoushi";
import { Kyousouba } from "../../entities/Kyousouba";
import { Race } from "../../entities/Race";
import { RaceSeiseki } from "../../entities/RaceSeiseki";
import { Shussouba } from "../../entities/Shussouba";
import { ShussoubaHyouka } from "../../entities/ShussoubaHyouka";
import { ShussoubaSeiseki } from "../../entities/ShussoubaSeiseki";
import { ShussoubaTsuukaJuni } from "../../entities/ShussoubaTsuukaJuni";
import { Uma } from "../../entities/Uma";
import {
  readDouble,
  readInt,
  readPositiveDouble,
  readPositiveInt,
  readSignedInt,
  readStr,
  readStrWithNoSpace,
  readTime,
} from "../Reader";
import { ShussoubaInfo } from "../ShussoubaTool";
import { jrdbKaisaiShussoubaTool } from "./JrdbKaisaiShussoubaTool";
import { jrdbOddsHaitouTool } from "./JrdbOddsHaitouTool";
import { jrdbRaceTool } from "./JrdbRaceTool";
import { JrdbShussoubaData } from "./JrdbShussoubaData";
import { jrdbShussoubaTool } from "./JrdbShussoubaTool";

export abstract class Se$ extends JrdbShussoubaData {
  protected getKaisaiTool() {
    return jrdbKaisaiShussoubaTool;
  }

  protected async saveKyousouba(buffer: Buffer, info: ShussoubaInfo) {
    let uma = {} as Uma;
    uma.KettouTourokuBangou = readStr(buffer, 10, 8);
    uma = await umaDao.saveUma(uma);
    info.uma = uma;
    const kyousouba = {} as Kyousouba;
    kyousouba.UmaId = uma.Id;
    const choukyoushi = await this.saveChoukyoushi(buffer);
    kyousouba.ChoukyoushiId = choukyoushi?.Id;
    await umaDao.saveKyousouba(kyousouba);
  }

  protected saveChoukyoushi(buffer: Buffer) {
    const choukyoushi = {} as Choukyoushi;
    choukyoushi.JrdbChoukyoushiCode = readPositiveInt(buffer, 327, 5);
    const choukyoushiMei = readStrWithNoSpace(buffer, 162, 12);
    return choukyoushiDao.saveChoukyoushi(choukyoushi, choukyoushiMei);
  }

  protected setRace(buffer: Buffer, toBe: Race) {
    jrdbRaceTool.setRaceJouken(buffer, toBe, 62, 71);
    toBe.Tousuu = readPositiveInt(buffer, 130, 2);
    toBe.Course = $R.course.toCodeFromJrdb(buffer, 339, 1);
  }

  protected async saveRaceRelated(buffer: Buffer, race: Race) {
    await this.saveRaceSeiseki(buffer, race.Id);
    await jrdbRaceTool.saveRaceMei(buffer, 80, 50, race);
    await jrdbRaceTool.saveRaceMei(buffer, 132, 8, race);
  }

  protected setRaceSeiseki(buffer: Buffer, toBe: RaceSeiseki) {
    toBe.Baba = $R.baba.toCodeFromJrdb(buffer, 69, 1);
    toBe.BabaSokudo = $R.babaSokudo.toCodeFromJrdb(buffer, 70, 1);
    toBe.Pace = $R.pace.toCodeFromJrdb(buffer, 221, 1);
    toBe.PaceShisuu = readDouble(buffer, 238, 5);
    toBe.Tenki = $R.tenki.toCodeFromJrdb(buffer, 338, 1);
  }

  protected async saveShussoubaRelated(buffer: Buffer, shussouba: Shussouba) {
    await super.saveShussoubaRelated(buffer, shussouba);
    await this.saveShussoubaSeiseki(buffer, shussouba.Id);
    await this.saveShussoubaHyouka(buffer, shussouba.Id);
    await this.saveOddsHaitou(buffer, shussouba);
    await this.saveShussoubaTsuukaJuni(buffer, shussouba.Id);
  }

  protected async saveShussoubaSeiseki(buffer: Buffer, shussoubaId: number) {
    const toBe = {} as ShussoubaSeiseki;
    toBe.Id = shussoubaId;
    await this.setShussoubaSeiseki(buffer, toBe);
    upsertLater(ShussoubaSeiseki, toBe, this.keepExisting);
  }

  protected async setShussoubaSeiseki(buffer: Buffer, toBe: ShussoubaSeiseki) {
    toBe.KakuteiChakujun = readPositiveInt(buffer, 140, 2);
    toBe.ChakujunFuka = $S.chakujunFuka.toCodeFromJrdb(buffer, 142, 1);
    toBe.Time = readTime(buffer, 143, 4);
    toBe.Kinryou = readPositiveDouble(buffer, 147, 3, 0.1);
    const kyori = readInt(buffer, 62, 4);
    if (1200 <= kyori) {
      toBe.Ten3F = readPositiveDouble(buffer, 258, 3, 0.1);
      if (toBe.Time && toBe.Ten3F) {
        toBe.Ten3FIkou = toBe.Time - toBe.Ten3F;
      }
    }
    toBe.Agari3F = readPositiveDouble(buffer, 261, 3, 0.1);
    if (toBe.Time && toBe.Agari3F) {
      toBe.Agari3FIzen = toBe.Time - toBe.Agari3F;
    }
    if (1200 < kyori && toBe.Ten3F && toBe.Agari3F) {
      toBe.Douchuu = toBe.Time - toBe.Ten3F - toBe.Agari3F;
    }
    const kishu = await jrdbShussoubaTool.saveKishu(buffer, 322, 150);
    toBe.KishuId = kishu ? kishu.Id : null;
    toBe.Bataijuu = readPositiveInt(buffer, 332, 3);
    toBe.Zougen = readSignedInt(buffer, 335, 3);
    toBe.Chaku12TimeSa = readDouble(buffer, 255, 3, 0.1);
    toBe.Ten3FSentouSa = readDouble(buffer, 316, 3, 0.1);
    toBe.Agari3FSentouSa = readDouble(buffer, 319, 3, 0.1);
    toBe.Bikou = readStr(buffer, 264, 24);
  }

  protected async saveShussoubaHyouka(buffer: Buffer, shussoubaId: number) {
    const toBe = {} as ShussoubaHyouka;
    toBe.Id = shussoubaId;
    this.setShussoubaHyouka(buffer, toBe);

    upsertLater(ShussoubaHyouka, toBe, this.keepExisting);
  }

  protected setShussoubaHyouka(buffer: Buffer, toBe: ShussoubaHyouka) {
    toBe.Idm = readInt(buffer, 182, 3);
    toBe.IdmSoten = readInt(buffer, 185, 3);
    toBe.IdmBabasa = readInt(buffer, 188, 3);
    toBe.IdmPace = readInt(buffer, 191, 3);
    toBe.IdmDeokure = readInt(buffer, 194, 3);
    toBe.IdmIchidori = readInt(buffer, 197, 3);
    toBe.IdmFuri = readInt(buffer, 200, 3);
    toBe.IdmTen3FFuri = readInt(buffer, 203, 3);
    toBe.IdmDouchuuFuri = readInt(buffer, 206, 3);
    toBe.IdmAgari3FFuri = readInt(buffer, 209, 3);
    toBe.IdmRace = readInt(buffer, 212, 3);
    toBe.CourseDori = $S.ichi.toCodeFromJrdb(buffer, 215, 1);
    toBe.JoushoudoCode = $S.joushoudo.toCodeFromJrdb(buffer, 216, 1);
    toBe.ClassCode = $S.classCode.toCodeFromJrdb(buffer, 217, 2);
    toBe.BataiCode = $S.bataiCode.toCodeFromJrdb(buffer, 219, 1);
    toBe.KehaiCode = $S.kehaiCode.toCodeFromJrdb(buffer, 220, 1);
    toBe.Pace = $R.pace.toCodeFromJrdb(buffer, 222, 1);
    toBe.Ten3FShisuu = readDouble(buffer, 223, 5);
    toBe.Agari3FShisuu = readDouble(buffer, 228, 5);
    toBe.PaceShisuu = readDouble(buffer, 233, 5);
    toBe.Kyakushitsu = $S.kyakushitsu.toCodeFromJrdb(buffer, 340, 1);
  }

  protected async saveOddsHaitou(buffer: Buffer, shussouba: Shussouba) {
    await jrdbOddsHaitouTool.saveOddsNinki(buffer, shussouba, {
      Kakutei: $C.Kakutei.Kakutei,
      Baken: $C.Baken.Tanshou,
      OddsOffset: 174,
      OddsLength: 6,
      NinkiOffset: 180,
    });
    await jrdbOddsHaitouTool.saveOddsNinki(buffer, shussouba, {
      Kakutei: $C.Kakutei.Kakutei,
      Baken: $C.Baken.Fukushou,
      OddsOffset: 290,
      OddsLength: 6,
    });
    await jrdbOddsHaitouTool.saveOddsNinki(buffer, shussouba, {
      Kakutei: $C.Kakutei.ToujitsuAM,
      Baken: $C.Baken.Tanshou,
      OddsOffset: 296,
      OddsLength: 6,
    });
    await jrdbOddsHaitouTool.saveOddsNinki(buffer, shussouba, {
      Kakutei: $C.Kakutei.ToujitsuAM,
      Baken: $C.Baken.Fukushou,
      OddsOffset: 302,
      OddsLength: 6,
    });
  }

  protected async saveShussoubaTsuukaJuni(buffer: Buffer, shussoubaId: number) {
    for (let bangou = 1, offset = 308; bangou <= 4; bangou++, offset += 2) {
      const shussoubaTsuukaJuni = {} as ShussoubaTsuukaJuni;

      const juni = readPositiveInt(buffer, offset, 2);
      if (juni === null || 28 < juni) {
        continue;
      }
      shussoubaTsuukaJuni.Id = shussoubaId * 2 ** 3 + bangou;
      shussoubaTsuukaJuni.ShussoubaId = shussoubaId;
      shussoubaTsuukaJuni.Bangou = bangou;
      shussoubaTsuukaJuni.Juni = juni;
      save(ShussoubaTsuukaJuni, shussoubaTsuukaJuni);
    }
  }

  protected async teardown() {
    const rows = query<{ Id: number; TimeSa: number }>(`SELECT
    SS.Id AS Id, ROUND(SS.Time - T.MinTime, 1) AS TimeSa
  FROM
    Shussouba S
    INNER JOIN ShussoubaSeiseki SS ON S.Id = SS.Id
    INNER JOIN (SELECT RaceId, MIN(Time) AS MinTime FROM Shussouba S_ INNER JOIN ShussoubaSeiseki SS_ ON S_.Id = SS_.Id GROUP BY RaceId HAVING COUNT(TimeSa) = 0) T ON S.RaceId = T.RaceId
  `);
    for (const row of rows) {
      updateBy(ShussoubaSeiseki, { Id: row.Id }, { TimeSa: row.TimeSa });
    }
    await super.teardown();
  }
}
