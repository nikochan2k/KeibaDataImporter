import { crc16 } from "crc";
import { Logger } from "log4js";
import { Inject, Service } from "typedi";
import { EntityManager } from "typeorm";
import { OrmManager } from "typeorm-typedi-extensions";
import * as $CH from "../../converters/Choukyou";
import { ChoukyouDao } from "../../daos/ChoukyouDao";
import { MeishouDao } from "../../daos/MeishouDao";
import { UmaDao } from "../../daos/UmaDao";
import { Choukyou } from "../../entities/Choukyou";
import { ChoukyouRireki } from "../../entities/ChoukyouRireki";
import { ChoukyouTime } from "../../entities/ChoukyouTime";
import { Kubun } from "../../entities/Meishou";
import { Uma } from "../../entities/Uma";
import { getLogger } from "../../LogUtil";
import {
  readDate,
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

  private logger: Logger;

  @OrmManager()
  private entityManager: EntityManager;

  @Inject()
  private tool: Tool;

  @Inject()
  private umaDao: UmaDao;

  @Inject()
  private meishouDao: MeishouDao;

  @Inject()
  private choukyouDao: ChoukyouDao;

  constructor() {
    this.logger = getLogger(this);
  }

  public async saveChoukyou(choukyou: Choukyou) {
    this.choukyouDao.save(choukyou);
  }

  public async saveChoukyouRireki(buffer: Buffer, offset: number, umaId: number, tanshukuKishuMei: string, awase?: string
  ) {
    const kijousha = readStrWithNoSpace(buffer, offset + 1, 8);
    if (!kijousha) {
      return;
    }

    const choukyouRireki = new ChoukyouRireki();
    const dateId = this.tool.getDateId(buffer, offset + 9);
    const buf = buffer.slice(offset + 27, 42);
    const hash = crc16(buf);
    choukyouRireki.Id = umaId * (2 ** (16 + 16)) + dateId * (2 ** 16) + hash;
    choukyouRireki.UmaId = umaId;
    choukyouRireki.ChoukyouFlag = $CH.choukyouFlag.toCodeFromKol(buffer, offset, 1);
    choukyouRireki.Noriyaku = $CH.noriyaku.toCodeFromKol(kijousha);
    const nengappi = readDate(buffer, offset + 9, 8);
    choukyouRireki.Nengappi = nengappi;
    if (!choukyouRireki.Noriyaku) {
      if (tanshukuKishuMei === kijousha) {
        choukyouRireki.Noriyaku = $CH.Noriyaku.HonbanKishu; // 本番騎手
      } else {
        choukyouRireki.Noriyaku = $CH.Noriyaku.ChoukyouKishu; // 調教騎手
        const meishou = await this.meishouDao.save(Kubun.Tanshuku, kijousha);
        choukyouRireki.TanshukuKishuMeiId = meishou.Id;
      }
    }
    const bashoCourse = readStrWithNoSpace(buffer, offset + 17, 8);
    choukyouRireki.Basho = $CH.basho.toCodeFromKol(bashoCourse);
    choukyouRireki.Type = $CH.type.toCodeFromKol(bashoCourse);
    choukyouRireki.Course = $CH.course.toCodeFromKol(bashoCourse);
    if (choukyouRireki.Basho === $CH.ChoukyouBasho.Sonota || choukyouRireki.Type === $CH.ChoukyouType.Sonota) {
      choukyouRireki.BashoCourse = bashoCourse;
    }
    if (choukyouRireki.Type === $CH.ChoukyouType.Hanro || choukyouRireki.Type === $CH.ChoukyouType.Pool) {
      const array = /[0-9]+/.exec(readStr(buffer, offset + 39, 6));
      if (array !== null && 0 < array.length) {
        choukyouRireki.Kaisuu = parseInt(array[0]);
      }
    }
    choukyouRireki.Baba = $CH.baba.toCodeFromKol(buffer, offset + 25, 2); // 307
    choukyouRireki.IchiDori = readPositiveInt(buffer, offset + 69, 1);
    const oikiri = readStrWithNoSpace(buffer, offset + 70, 6);
    choukyouRireki.Oikiri = $CH.oikiri.toCodeFromKol(oikiri);
    choukyouRireki.Ashiiro = $CH.ashiiro.toCodeFromKol(oikiri);
    if (!choukyouRireki.Oikiri && !choukyouRireki.Ashiiro) {
      choukyouRireki.OikiriSonota = oikiri;
    }
    choukyouRireki.Yajirushi = $CH.yajirushi.toCodeFromKol(buffer, offset + 76, 1);
    choukyouRireki.Reigai = readStr(buffer, offset + 77, 40);
    if (awase) {
      let reigai = false;
      let execed = /^[\u30A1-\u30FC]+/.exec(awase);
      if (execed && 0 < execed.length) {
        const awaseUma = execed[0];
        const uma = new Uma();
        uma.KanaBamei = awaseUma;
        choukyouRireki.AwaseUmaId = (await this.umaDao.saveUma(uma)).Id;
      } else {
        reigai = true;
      }
      choukyouRireki.AwaseKekka = $CH.awaseKekka.toCodeFromKol(awase);
      if (!choukyouRireki.AwaseKekka) {
        reigai = true;
      }
      execed = /[0-9]+(\.[0-9]+)/.exec(awase);
      let timeSa: number;
      if (execed && 0 < execed.length) {
        timeSa = parseFloat(execed[0]);
        if (choukyouRireki.AwaseKekka === $CH.AwaseKekka.Okure) {
          timeSa *= -1;
        }
      } else {
        timeSa = 0.0;
      }
      choukyouRireki.TimeSa = timeSa;
      choukyouRireki.Chakusa = $CH.chakusa.toCodeFromKol(awase);
      if (choukyouRireki.AwaseKekka !== $CH.AwaseKekka.Dounyuu && timeSa === 0.0 && !choukyouRireki.Chakusa) {
        reigai = true;
      }
      if (reigai) {
        choukyouRireki.AwaseReigai = awase;
      }
    }
    await this.entityManager.save(choukyouRireki);

    if (choukyouRireki.Type === $CH.ChoukyouType.Hanro) {
      await this.saveChoukyouRirekiTime(buffer, choukyouRireki, offset, KolChoukyouTool.hanroFurlongOffsets);
    } else if ($CH.ChoukyouType.Shiba <= choukyouRireki.Type || choukyouRireki.Type <= $CH.ChoukyouType.Shougai) {
      await this.saveChoukyouRirekiTime(buffer, choukyouRireki, offset, KolChoukyouTool.courseFurlongOffsets);
    }
  }

  protected async saveChoukyouRirekiTime(buffer: Buffer, choukyouRireki: ChoukyouRireki, offset: number, cfList: FurlongOffset[]) {
    for (let i = 0; i < cfList.length; i++) {
      const cf = cfList[i];
      const comment = readStr(buffer, offset + cf.offset, 6);
      if (!comment || comment === "-") {
        continue;
      }
      const choukyouRirekiTime = new ChoukyouTime();
      choukyouRirekiTime.Id = choukyouRireki.Id * (2 ** 3) + (cf.f - 1);
      choukyouRirekiTime.ChoukyouRirekiId = choukyouRireki.Id;
      choukyouRirekiTime.F = cf.f;
      const time = parseFloat(comment);
      if (isNaN(time)) {
        choukyouRirekiTime.Comment = comment;
      } else {
        choukyouRirekiTime.Time = time;
      }
      await this.entityManager.save(choukyouRirekiTime);
    }
  }

}