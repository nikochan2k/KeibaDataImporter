import { crc16 } from "crc";
import { Inject, Service } from "typedi";
import { EntityManager } from "typeorm";
import { OrmManager } from "typeorm-typedi-extensions";
import * as $CH from "../../converters/Choukyou";
import { ChoukyouDao } from "../../daos/ChoukyouDao";
import { JinmeiDao } from "../../daos/JinmeiDao";
import { UmaDao } from "../../daos/UmaDao";
import { ShussoubaChoukyou } from "../../entities/ShussoubaChoukyou";
import { Choukyou } from "../../entities/Choukyou";
import { ChoukyouTime } from "../../entities/ChoukyouTime";
import { JinmeiKubun } from "../../entities/Jinmei";
import { Uma } from "../../entities/Uma";
import {
  readInt,
  readPositiveInt,
  readStr,
  readStrWithNoSpace
} from "../Reader";
import { Tool } from "../Tool";

interface FurlongOffset {
  f: number;
  offset: number;
}

@Service()
export class KolChoukyouTool {

  private static readonly courseFurlongOffsets: FurlongOffset[] = [
    { f: 8, offset: 27 },
    { f: 7, offset: 33 },
    { f: 6, offset: 39 },
    { f: 5, offset: 45 },
    { f: 4, offset: 51 },
    { f: 3, offset: 57 },
    { f: 1, offset: 63 }
  ];

  private static readonly hanroFurlongOffsets: FurlongOffset[] = [
    { f: 4, offset: 45 },
    { f: 3, offset: 51 },
    { f: 2, offset: 57 },
    { f: 1, offset: 63 }
  ];

  @OrmManager()
  private entityManager: EntityManager;

  @Inject()
  private tool: Tool;

  @Inject()
  private umaDao: UmaDao;

  @Inject()
  private jinmeiDao: JinmeiDao;

  @Inject()
  private choukyouDao: ChoukyouDao;

  public async saveShussoubaChoukyou(sc: ShussoubaChoukyou) {
    this.choukyouDao.save(sc);
  }

  public async saveChoukyou(buffer: Buffer, offset: number, umaId: number, tanshukuKishuMei: string, awase?: string
  ) {
    const kijousha = readStrWithNoSpace(buffer, offset + 1, 8);
    if (!kijousha) {
      return;
    }

    const choukyou = new Choukyou();
    const dateId = this.tool.getDaysFrom1970(buffer, offset + 9);
    const buf = buffer.slice(offset + 27, 42);
    const hash = crc16(buf);
    choukyou.Id = umaId * (2 ** (15 + 16)) + dateId * (2 ** 16) + hash;
    choukyou.UmaId = umaId;
    choukyou.ChoukyouFlag = $CH.choukyouFlag.toCodeFromKol(buffer, offset, 1);
    choukyou.Noriyaku = $CH.noriyaku.toCodeFromKol(kijousha);
    const nengappi = readInt(buffer, offset + 9, 8);
    choukyou.Nengappi = nengappi;
    if (!choukyou.Noriyaku) {
      if (tanshukuKishuMei === kijousha) {
        choukyou.Noriyaku = $CH.Noriyaku.HonbanKishu; // 本番騎手
      } else {
        choukyou.Noriyaku = $CH.Noriyaku.ChoukyouKishu; // 調教騎手
        const jinmei = await this.jinmeiDao.save(JinmeiKubun.Tanshuku, kijousha);
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
        choukyou.Kaisuu = parseInt(array[0]);
      }
    }
    choukyou.Baba = $CH.baba.toCodeFromKol(buffer, offset + 25, 2); // 307
    choukyou.IchiDori = readPositiveInt(buffer, offset + 69, 1);
    const oikiri = readStrWithNoSpace(buffer, offset + 70, 6);
    choukyou.Oikiri = $CH.oikiri.toCodeFromKol(oikiri);
    choukyou.Ashiiro = $CH.ashiiro.toCodeFromKol(oikiri);
    if (!choukyou.Oikiri && !choukyou.Ashiiro) {
      choukyou.OikiriSonota = oikiri;
    }
    choukyou.Yajirushi = $CH.yajirushi.toCodeFromKol(buffer, offset + 76, 1);
    choukyou.Reigai = readStr(buffer, offset + 77, 40);
    if (awase) {
      let reigai = false;
      let execed = /^[\u30A1-\u30FC]+/.exec(awase);
      if (execed && 0 < execed.length) {
        const awaseUma = execed[0];
        let uma = new Uma();
        uma.KanaBamei = awaseUma;
        uma = await this.umaDao.saveUma(uma);
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
    await this.entityManager.save(choukyou);

    if (choukyou.Type === $CH.ChoukyouType.Hanro) {
      await this.saveChoukyouTime(buffer, choukyou, offset, KolChoukyouTool.hanroFurlongOffsets);
    } else if ($CH.ChoukyouType.Shiba <= choukyou.Type || choukyou.Type <= $CH.ChoukyouType.Shougai) {
      await this.saveChoukyouTime(buffer, choukyou, offset, KolChoukyouTool.courseFurlongOffsets);
    }
  }

  protected async saveChoukyouTime(buffer: Buffer, choukyou: Choukyou, offset: number, cfList: FurlongOffset[]) {
    for (let i = 0; i < cfList.length; i++) {
      const cf = cfList[i];
      const comment = readStr(buffer, offset + cf.offset, 6);
      if (!comment || comment === "-") {
        continue;
      }
      const choukyouTime = new ChoukyouTime();
      choukyouTime.Id = choukyou.Id * (2 ** 3) + (cf.f - 1);
      choukyouTime.ChoukyouId = choukyou.Id;
      choukyouTime.F = cf.f;
      const time = parseFloat(comment);
      if (isNaN(time)) {
        choukyouTime.Comment = comment;
      } else {
        choukyouTime.Time = time;
      }
      await this.entityManager.save(choukyouTime);
    }
  }

}