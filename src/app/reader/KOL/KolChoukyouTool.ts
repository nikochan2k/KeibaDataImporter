import { Inject, Injectable } from "@nestjs/common";
import { EntityManager } from "typeorm";
import * as $CH from "../../converters/Choukyou";
import { ChoukyouDao } from "../../daos/ChoukyouDao";
import { JinmeiDao } from "../../daos/JinmeiDao";
import { UmaDao } from "../../daos/UmaDao";
import { Choukyou } from "../../entities/Choukyou";
import { ChoukyouTime } from "../../entities/ChoukyouTime";
import { ShussoubaChoukyou } from "../../entities/ShussoubaChoukyou";
import { Uma } from "../../entities/Uma";
import { OrmManager } from "../../OrmManager";
import { readInt, readPositiveInt, readStr, readStrWithNoSpace } from "../Reader";
import { getChoukyouId, Tool } from "../Tool";

interface FurlongOffset {
  f: number;
  offset: number;
}

@Injectable()
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

    const dateId = this.tool.getDaysFrom1970(buffer, offset + 9);
    if (dateId === null) {
      return;
    }

    const choukyou = new Choukyou();
    choukyou.UmaId = umaId;
    choukyou.Noriyaku = $CH.noriyaku.toCodeFromKol(kijousha);
    const nengappi = readInt(buffer, offset + 9, 8);
    choukyou.Nengappi = nengappi;
    if (!choukyou.Noriyaku) {
      if (tanshukuKishuMei === kijousha) {
        choukyou.Noriyaku = $CH.Noriyaku.HonbanKishu; // 本番騎手
      } else {
        choukyou.Noriyaku = $CH.Noriyaku.ChoukyouKishu; // 調教騎手
        const jinmei = await this.jinmeiDao.save(kijousha);
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

    let times: ChoukyouTime[] = [];
    if (choukyou.Type === $CH.ChoukyouType.Hanro) {
      times = this.readChoukyouTimes(buffer, offset, KolChoukyouTool.hanroFurlongOffsets);
    } else if (
      $CH.ChoukyouType.Shiba <= choukyou.Type &&
      choukyou.Type <= $CH.ChoukyouType.Shougai
    ) {
      times = this.readChoukyouTimes(buffer, offset, KolChoukyouTool.courseFurlongOffsets);
    }

    choukyou.Renban = await this.findRenban(choukyou, dateId, times);
    choukyou.Id = getChoukyouId(umaId, dateId, choukyou.Basho, choukyou.Type, choukyou.Renban);
    await this.entityManager.save(choukyou);

    for (const choukyouTime of times) {
      choukyouTime.ChoukyouId = choukyou.Id;
      await this.entityManager.save(choukyouTime);
    }

    const sc = new ShussoubaChoukyou();
    sc.ShussoubaId = shussoubaId;
    sc.ChoukyouId = choukyou.Id;
    sc.ChoukyouFlag = $CH.choukyouFlag.toCodeFromKol(buffer, offset, 1);
    sc.Yajirushi = $CH.yajirushi.toCodeFromKol(buffer, offset + 76, 1);
    sc.Reigai = readStr(buffer, offset + 77, 40);
    await this.choukyouDao.saveShussoubaChoukyou(sc);
  }

  /**
   * 同じ馬・同じ日・同じ場所・同じ種別の調教が既にあれば、同じ調教かどうかを比べて連番を決めます。
   * 同じ調教はレースごとのファイル(DEN2/SEI2/UMA)に何度も出てくるため、同じ内容ならその連番を使い、
   * 違う内容なら空いている次の連番を使います。
   */
  protected async findRenban(choukyou: Choukyou, dateId: number, times: ChoukyouTime[]) {
    const { UmaId, Basho, Type } = choukyou;
    for (let renban = 1; renban <= 4; renban++) {
      const id = getChoukyouId(UmaId, dateId, Basho, Type, renban);
      const asIs = await this.entityManager.findOneBy(Choukyou, { Id: id });
      if (!asIs) {
        return renban;
      }
      const asIsTimes = await this.entityManager.findBy(ChoukyouTime, { ChoukyouId: id });
      if (this.isSameChoukyou(asIs, asIsTimes, choukyou, times)) {
        return renban;
      }
    }
    throw new Error(
      `同じ馬・同じ日・同じ場所・同じ種別の調教が多すぎます: ${JSON.stringify({ UmaId, dateId, Basho, Type })}`,
    );
  }

  /**
   * 調教の中身で同じ調教かを判定します。
   * 片方にしかない項目は比べません(JRDB の本追切から作った調教には馬場や時計がないため)。
   * 乗り役・併せはレース(出走馬)ごとに変わりうるので比べません。
   */
  protected isSameChoukyou(
    asIs: Choukyou,
    asIsTimes: ChoukyouTime[],
    toBe: Choukyou,
    toBeTimes: ChoukyouTime[],
  ) {
    const keys: (keyof Choukyou)[] = [
      "Course",
      "BashoCourse",
      "Baba",
      "Kaisuu",
      "IchiDori",
      "Oikiri",
      "Ashiiro",
      "OikiriSonota",
    ];
    if (keys.some((key) => asIs[key] != null && toBe[key] != null && asIs[key] !== toBe[key])) {
      return false;
    }
    if (asIsTimes.length === 0 || toBeTimes.length === 0) {
      return true;
    }
    // Time は real 型で精度が落ちるため 0.1 秒単位に丸めて比べる
    const toKey = (list: ChoukyouTime[]) =>
      list
        .map((t) => `${t.F}:${t.Time == null ? "" : Math.round(t.Time * 10)}:${t.Comment ?? ""}`)
        .sort()
        .join(",");
    return toKey(asIsTimes) === toKey(toBeTimes);
  }

  protected readChoukyouTimes(buffer: Buffer, offset: number, cfList: FurlongOffset[]) {
    const times: ChoukyouTime[] = [];
    for (let i = 0; i < cfList.length; i++) {
      const cf = cfList[i];
      const comment = readStr(buffer, offset + cf.offset, 6);
      if (!comment || comment === "-") {
        continue;
      }
      const choukyouTime = new ChoukyouTime();
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
