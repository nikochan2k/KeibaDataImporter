import * as $C from "../../converters/Common";
import * as $R from "../../converters/Race";
import { jinmeiDao } from "../../daos/JinmeiDao";
import { raceDao } from "../../daos/RaceDao";
import { umaDao } from "../../daos/UmaDao";
import { Race } from "../../entities/Race";
import { RaceHassouJoukyou } from "../../entities/RaceHassouJoukyou";
import { Record } from "../../entities/Record";
import { ShussoubaHassouJoukyou } from "../../entities/ShussoubaHassouJoukyou";
import { Uma } from "../../entities/Uma";
import { RaceTool } from "../RaceTool";
import {
  readInt,
  readPositiveDouble,
  readPositiveInt,
  readStr,
  readStrWithNoSpace,
  readTime,
} from "../Reader";
import { tool } from "../Tool";
import { kolKaisaiTool } from "./KolKaisaiTool";

export interface RaceLapTimeInfo {
  Offset: number;
  Length: number;
  /** 値に掛ける数。省略時は 0.1 (0.1 秒単位の整数)。小数点付きの秒(例: "104.9")は 1 */
  Mul?: number;
  KaishiKyori: number;
  ShuuryouKyori: number;
}

export class KolRaceTool extends RaceTool {
  protected getRaceBangou(buffer: Buffer) {
    const raceBangou = readPositiveInt(buffer, 10, 2);
    if (raceBangou === null) {
      return null;
    }
    return raceBangou;
  }

  public getRace(buffer: Buffer, kaisaiId?: number) {
    if (!kaisaiId) {
      kaisaiId = kolKaisaiTool.getKaisaiId(buffer);
    }
    return super.getRace(buffer, kaisaiId);
  }

  public getRaceId(buffer: Buffer) {
    const kaisaiId = kolKaisaiTool.getKaisaiId(buffer);
    return super.getRaceId(buffer, kaisaiId);
  }

  public async getRecord(buffer: Buffer, offset: number, bashoOffset: number) {
    const bamei = readStrWithNoSpace(buffer, offset + 12, 30);
    if (!bamei) {
      return null;
    }

    const record = new Record();
    const nengappi = readInt(buffer, offset, 8);
    record.Nengappi = nengappi;
    record.Time = readTime(buffer, offset + 8, 4);
    let uma = new Uma();
    if (tool.isEnglish(bamei)) {
      uma.EigoBamei = bamei;
    } else {
      uma.KanaBamei = bamei;
    }
    uma = await umaDao.saveUma(uma);
    record.UmaId = uma.Id;
    record.Kinryou = readPositiveDouble(buffer, offset + 42, 3, 0.1);
    const tanshukuKishuMei = readStrWithNoSpace(buffer, offset + 45, 8);
    const jinmei = await jinmeiDao.save(tanshukuKishuMei);
    record.TanshukuKishuMeiId = jinmei.Id;
    record.Basho = $C.basho.toCodeFromKol(buffer, bashoOffset, 2);
    return raceDao.saveRecord(record);
  }

  public async saveRaceHassouJoukyou(buffer: Buffer, offset: number, race: Race) {
    for (let bangou = 1; bangou <= 6; bangou++, offset += 80) {
      const hassouJoukyou = readStr(buffer, offset, 80);
      if (!hassouJoukyou) {
        continue;
      }

      const rhj = new RaceHassouJoukyou();
      rhj.Id = race.Id * 2 ** 3 + bangou;
      rhj.RaceId = race.Id;
      rhj.HassouJoukyou = hassouJoukyou;
      const comment = hassouJoukyou.replace(/(\([0-9]+\))+/, "");
      rhj.Ichi = $R.ichi.toCodeFromKol(comment);
      rhj.Joukyou = $R.joukyou.toCodeFromKol(comment);
      let execed: RegExpExecArray;
      execed = /([0-9.]+|半)馬身(半)?/.exec(comment);
      if (execed) {
        const bashinStr = execed[1];
        let bashin: number;
        if (bashinStr === "半") {
          bashin = 0.5;
        } else {
          bashin = Number.parseFloat(bashinStr);
          if (execed[2]) {
            bashin += 0.5;
          }
        }
        if (0 < bashin) {
          rhj.FuriBashin = bashin;
        }
      }
      if (!rhj.FuriBashin) {
        execed = /([0-9.]+)秒/.exec(comment);
        if (execed) {
          const byou = Number.parseFloat(execed[1]);
          if (0 < byou) {
            rhj.FuriByou = byou;
          }
        }
      }
      await this.entityManager.getRepository(RaceHassouJoukyou).save(rhj);

      for (const m of hassouJoukyou.matchAll(/\((\d+)\)/g)) {
        const umaban = Number.parseInt(m[1], 10);
        if (0 < umaban) {
          const shj = new ShussoubaHassouJoukyou();
          shj.Id = rhj.Id * 2 ** 6 + umaban;
          shj.RaceHassouJoukyouId = rhj.Id;
          shj.ShussoubaId = race.Id * 2 ** 6 + umaban;
          await this.entityManager.getRepository(ShussoubaHassouJoukyou).save(shj);
        }
      }
    }
  }

  public async saveSpecialRaceLapTime(buffer: Buffer, race: Race, infos: RaceLapTimeInfo[]) {
    for (const info of infos) {
      const lapTime = readPositiveDouble(buffer, info.Offset, info.Length, info.Mul ?? 0.1);
      if (lapTime) {
        await this.saveLap(race, info.KaishiKyori, info.ShuuryouKyori, lapTime);
      }
    }
  }
}

export const kolRaceTool = new KolRaceTool();
