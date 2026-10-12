import * as $C from "../../converters/Common";
import * as $R from "../../converters/Race";
import { jinmeiDao } from "../../daos/JinmeiDao";
import { recordDao } from "../../daos/RecordDao";
import { umaDao } from "../../daos/UmaDao";
import { save } from "../../db/helpers";
import { Race } from "../../entities/Race";
import { RaceHassouJoukyou } from "../../entities/RaceHassouJoukyou";
import { Record } from "../../entities/Record";
import { RecordHoyuuba } from "../../entities/RecordHoyuuba";
import { ShussoubaHassouJoukyou } from "../../entities/ShussoubaHassouJoukyou";
import { Uma } from "../../entities/Uma";
import { RaceTool } from "../RaceTool";
import {
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

  /**
   * レースの出馬表・成績にある、そのレースのコースのレコードを保存します。馬名がなければ null。
   * 距離・芝ダートなどはそのレースのもの。kubunOffset はレコードフラグ (コースレコードだけにある) の位置。
   */
  public async saveRecord(
    buffer: Buffer,
    offset: number,
    bashoOffset: number,
    shubetsu: $R.RecordShubetsu,
    race: Race,
    kubunOffset?: number,
  ) {
    const bamei = readStrWithNoSpace(buffer, offset + 12, 30);
    const nengappi = readPositiveInt(buffer, offset, 8);
    const time = readTime(buffer, offset + 8, 4);
    if (!bamei || !nengappi || !time) {
      return null;
    }
    let uma = {} as Uma;
    if (tool.isEnglish(bamei)) {
      uma.EigoBamei = bamei;
    } else {
      uma.KanaBamei = bamei;
    }
    uma = await umaDao.saveUma(uma);
    const jinmei = await jinmeiDao.save(readStrWithNoSpace(buffer, offset + 45, 8));

    const record = {} as Record;
    record.Shubetsu = shubetsu;
    record.Nengappi = nengappi;
    record.Time = time;
    if (kubunOffset !== undefined) {
      record.Kubun = $R.recordKubun.toCodeFromKol(buffer, kubunOffset, 1);
    }
    record.Basho = $C.basho.toCodeFromKol(buffer, bashoOffset, 2);
    record.Kyori = race.Kyori;
    record.DirtShiba = race.DirtShiba;
    record.MigiHidari = race.MigiHidari;
    record.UchiSoto = race.UchiSoto;
    return recordDao.saveRecord(record, [
      {
        UmaId: uma.Id,
        Kinryou: readPositiveDouble(buffer, offset + 42, 3, 0.1),
        TanshukuKishuMeiId: jinmei.Id,
      } as RecordHoyuuba,
    ]);
  }

  public async saveRaceHassouJoukyou(buffer: Buffer, offset: number, race: Race) {
    for (let bangou = 1; bangou <= 6; bangou++, offset += 80) {
      const hassouJoukyou = readStr(buffer, offset, 80);
      if (!hassouJoukyou) {
        continue;
      }

      const rhj = {} as RaceHassouJoukyou;
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
      save(RaceHassouJoukyou, rhj);

      for (const m of hassouJoukyou.matchAll(/\((\d+)\)/g)) {
        const umaban = Number.parseInt(m[1], 10);
        if (0 < umaban) {
          const shj = {} as ShussoubaHassouJoukyou;
          shj.Id = rhj.Id * 2 ** 6 + umaban;
          shj.RaceHassouJoukyouId = rhj.Id;
          shj.ShussoubaId = race.Id * 2 ** 6 + umaban;
          save(ShussoubaHassouJoukyou, shj);
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
