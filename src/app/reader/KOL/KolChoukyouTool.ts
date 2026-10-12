import * as $CH from "../../converters/Choukyou";
import { choukyouDao } from "../../daos/ChoukyouDao";
import { jinmeiDao } from "../../daos/JinmeiDao";
import { umaDao } from "../../daos/UmaDao";
import { Choukyou } from "../../entities/Choukyou";
import { ChoukyouTime } from "../../entities/ChoukyouTime";
import { ShussoubaChoukyou } from "../../entities/ShussoubaChoukyou";
import { Uma } from "../../entities/Uma";
import { readInt, readPositiveInt, readStr, readStrWithNoSpace } from "../Reader";
import { tool } from "../Tool";

interface FurlongOffset {
  f: number;
  offset: number;
}

export class KolChoukyouTool {
  private static readonly courseFurlongOffsets: FurlongOffset[] = [
    { f: 8, offset: 27 },
    { f: 7, offset: 33 },
    { f: 6, offset: 39 },
    { f: 5, offset: 45 },
    { f: 4, offset: 51 },
    { f: 3, offset: 57 },
    { f: 1, offset: 63 },
  ];

  private static readonly hanroFurlongOffsets: FurlongOffset[] = [
    { f: 4, offset: 45 },
    { f: 3, offset: 51 },
    { f: 2, offset: 57 },
    { f: 1, offset: 63 },
  ];

  /**
   * 調教 1 件を保存し、出走馬と結びつけます。
   * 調教フラグ・矢印・例外はレース(出走馬)ごとに変わるので、連関(ShussoubaChoukyou)に持たせます。
   */
  public async saveChoukyou(
    buffer: Buffer,
    offset: number,
    shussoubaId: number,
    umaId: number,
    tanshukuKishuMei: string,
    awase?: string,
  ) {
    const kijousha = readStrWithNoSpace(buffer, offset + 1, 8);
    if (!kijousha) {
      return;
    }

    const dateId = tool.getDaysFrom1970(buffer, offset + 9);
    if (dateId === null) {
      return;
    }

    const choukyou = {} as Choukyou;
    choukyou.UmaId = umaId;
    choukyou.Noriyaku = $CH.noriyaku.toCodeFromKol(kijousha);
    const nengappi = readInt(buffer, offset + 9, 8);
    choukyou.Nengappi = nengappi;
    if (!choukyou.Noriyaku) {
      if (tanshukuKishuMei === kijousha) {
        choukyou.Noriyaku = $CH.Noriyaku.HonbanKishu; // 本番騎手
      } else {
        choukyou.Noriyaku = $CH.Noriyaku.ChoukyouKishu; // 調教騎手
        const jinmei = await jinmeiDao.save(kijousha);
        choukyou.TanshukuKishuMeiId = jinmei.Id;
      }
    }
    const bashoCourse = readStrWithNoSpace(buffer, offset + 17, 8);
    choukyou.Basho = $CH.basho.toCodeFromKol(bashoCourse);
    choukyou.Type = $CH.type.toCodeFromKol(bashoCourse);
    choukyou.Course = $CH.course.toCodeFromKol(bashoCourse);
    if (choukyou.Basho === $CH.ChoukyouBasho.Sonota || choukyou.Type === $CH.ChoukyouType.Sonota) {
      choukyou.BashoCourse = bashoCourse;
    }
    if (choukyou.Type === $CH.ChoukyouType.Hanro || choukyou.Type === $CH.ChoukyouType.Pool) {
      const array = /[0-9]+/.exec(readStr(buffer, offset + 39, 6));
      if (array !== null && 0 < array.length) {
        choukyou.Kaisuu = parseInt(array[0], 10);
      }
    }
    choukyou.Baba = $CH.baba.toCodeFromKol(buffer, offset + 25, 2);
    choukyou.IchiDori = readPositiveInt(buffer, offset + 69, 1);
    const oikiri = readStrWithNoSpace(buffer, offset + 70, 6);
    choukyou.Oikiri = $CH.oikiri.toCodeFromKol(oikiri);
    choukyou.Ashiiro = $CH.ashiiro.toCodeFromKol(oikiri);
    if (!choukyou.Oikiri && !choukyou.Ashiiro) {
      choukyou.OikiriSonota = oikiri;
    }
    if (awase) {
      let reigai = false;
      let execed = /^[\u30A1-\u30FC]+/.exec(awase);
      if (execed && 0 < execed.length) {
        const awaseUma = execed[0];
        let uma = {} as Uma;
        uma.KanaBamei = awaseUma;
        uma = await umaDao.saveUma(uma);
        choukyou.AwaseUmaId = uma.Id;
      } else {
        reigai = true;
      }
      choukyou.AwaseKekka = $CH.awaseKekka.toCodeFromKol(awase);
      if (!choukyou.AwaseKekka) {
        reigai = true;
      }
      execed = /[0-9]+(\.[0-9]+)/.exec(awase);
      let timeSa: number;
      if (execed && 0 < execed.length) {
        timeSa = parseFloat(execed[0]);
        if (choukyou.AwaseKekka === $CH.AwaseKekka.Okure) {
          timeSa *= -1;
        }
      } else {
        timeSa = 0.0;
      }
      choukyou.TimeSa = timeSa;
      choukyou.Chakusa = $CH.chakusa.toCodeFromKol(awase);
      if (choukyou.AwaseKekka !== $CH.AwaseKekka.Dounyuu && timeSa === 0.0 && !choukyou.Chakusa) {
        reigai = true;
      }
      if (reigai) {
        choukyou.AwaseReigai = awase;
      }
    }

    let times: ChoukyouTime[] = [];
    if (choukyou.Type === $CH.ChoukyouType.Hanro) {
      times = this.readChoukyouTimes(buffer, offset, KolChoukyouTool.hanroFurlongOffsets);
    } else if (
      $CH.ChoukyouType.Shiba <= choukyou.Type &&
      choukyou.Type <= $CH.ChoukyouType.Shougai
    ) {
      times = this.readChoukyouTimes(buffer, offset, KolChoukyouTool.courseFurlongOffsets);
    }

    choukyouDao.saveChoukyou(choukyou, dateId, times);

    const sc = {} as ShussoubaChoukyou;
    sc.ShussoubaId = shussoubaId;
    sc.ChoukyouId = choukyou.Id;
    sc.ChoukyouFlag = $CH.choukyouFlag.toCodeFromKol(buffer, offset, 1);
    sc.Yajirushi = $CH.yajirushi.toCodeFromKol(buffer, offset + 76, 1);
    sc.Reigai = readStr(buffer, offset + 77, 40);
    await choukyouDao.saveShussoubaChoukyou(sc);
  }

  protected readChoukyouTimes(buffer: Buffer, offset: number, cfList: FurlongOffset[]) {
    const times: ChoukyouTime[] = [];
    for (let i = 0; i < cfList.length; i++) {
      const cf = cfList[i];
      const comment = readStr(buffer, offset + cf.offset, 6);
      if (!comment || comment === "-") {
        continue;
      }
      const choukyouTime = {} as ChoukyouTime;
      choukyouTime.F = cf.f;
      const time = parseFloat(comment);
      if (Number.isNaN(time)) {
        choukyouTime.Comment = comment;
      } else {
        choukyouTime.Time = time;
      }
      times.push(choukyouTime);
    }
    return times;
  }
}

export const kolChoukyouTool = new KolChoukyouTool();
