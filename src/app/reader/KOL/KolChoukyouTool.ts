import { Logger } from "log4js";
import { Inject, Service } from "typedi";
import { EntityManager } from "typeorm";
import { OrmEntityManager } from "typeorm-typedi-extensions";
import * as $CH from "../../converters/Choukyou";
import { Choukyou } from "../../entities/Choukyou";
import { ChoukyouTime } from "../../entities/ChoukyouTime";
import { Kishu } from "../../entities/Kishu";
import { Shussouba } from "../../entities/Shussouba";
import { getLogger } from "../../LogUtil";
import { KishuDao } from "../../daos/KishuDao";
import {
  readDate,
  readPositiveInt,
  readStr,
  readStrWithNoSpace
  } from "../Reader";

export interface FurlongOffset {
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

  private logger: Logger;

  @OrmEntityManager()
  private entityManager: EntityManager;

  @Inject()
  private kishuDao: KishuDao;

  constructor() {
    this.logger = getLogger(this);
  }

  public async saveChoukyou(buffer: Buffer, shussouba: Shussouba, offset: number, bangou: number, awase?: string
  ) {
    const kijousha = readStrWithNoSpace(buffer, offset + 1, 8);
    if (!kijousha) {
      return;
    }
    const choukyou = new Choukyou();
    choukyou.Id = shussouba.Id * 10 + bangou;
    choukyou.Shussouba = shussouba;
    choukyou.Bangou = bangou;
    choukyou.ChoukyouFlag = $CH.choukyouFlag.toCodeFromKol(buffer, offset, 1);
    choukyou.Noriyaku = $CH.noriyaku.toCodeFromKol(kijousha);
    choukyou.Nengappi = readDate(buffer, offset + 9, 8);
    if (!choukyou.Noriyaku) {
      const kishu = new Kishu();
      kishu.TanshukuKishuMei = kijousha;
      choukyou.Kishu = await this.kishuDao.saveKishu(kishu);
      if (shussouba.Kishu.Id === choukyou.Kishu.Id) {
        choukyou.Noriyaku = 3; // 本番騎手
      } else {
        choukyou.Noriyaku = 4; // 調教騎手
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
      choukyou.Awase = awase;
    }
    await this.entityManager.persist(choukyou);

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
      choukyouTime.Id = choukyou.Id + cf.f;
      choukyouTime.Choukyou = choukyou;
      choukyouTime.F = cf.f;
      const time = parseFloat(comment);
      if (isNaN(time)) {
        choukyouTime.Comment = comment;
      } else {
        choukyouTime.Time = time;
      }
      await this.entityManager.persist(choukyouTime);
    }
  }

}