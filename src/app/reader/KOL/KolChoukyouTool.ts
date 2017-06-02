import { EntityManager } from "typeorm";
import { Logger } from "log4js";
import { getLogger } from "../../LogUtil";
import { readStr, readDate, readStrWithNoSpace, readPositiveInt } from "../Reader";
import { DataTool } from "../DataTool";
import { Shussouba } from "../../entities/Shussouba";
import { Kishu } from "../../entities/Kishu";
import { Choukyou } from "../../entities/Choukyou";
import { ChoukyouTime } from "../../entities/ChoukyouTime";
import { MasshouFlag } from "../../converters/Kishu";
import * as $CH from "../../converters/Choukyou";

export interface FurlongOffset {
  f: number;
  offset: number;
}

export class KolChoukyouTool {

  private logger: Logger;

  private tool: DataTool;

  constructor(protected entityManager: EntityManager, protected hanroFurlongOffsets: FurlongOffset[],
    protected courseFurlongOffsets: FurlongOffset[]) {
    this.logger = getLogger(this);
    this.tool = new DataTool(entityManager);
    this.hanroFurlongOffsets = hanroFurlongOffsets;
    this.courseFurlongOffsets = courseFurlongOffsets;
  }

  public async saveChoukyou(buffer: Buffer, shussouba: Shussouba, offset: number, awase?: string) {
    const kijousha = readStrWithNoSpace(buffer, offset + 1, 8);
    if (!kijousha) {
      return;
    }
    const choukyou = new Choukyou();
    choukyou.Id = shussouba.Id * 10 + 1;
    choukyou.Shussouba = shussouba;
    choukyou.Bangou = 1;
    choukyou.ChoukyouFlag = $CH.choukyouFlag.toCodeFromKol(buffer, offset, 1);
    choukyou.Noriyaku = $CH.noriyaku.toCodeFromKol(kijousha);
    choukyou.Nengappi = readDate(buffer, offset + 9, 8);
    if (!choukyou.Noriyaku) {
      const kishu = new Kishu();
      kishu.TanshukuKishuMei = kijousha;
      kishu.MasshouFlag = MasshouFlag.Geneki;
      kishu.FromNengappi = choukyou.Nengappi;
      kishu.ToNengappi = choukyou.Nengappi;
      choukyou.Kishu = await this.tool.saveKishu(kishu);
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
      await this.saveChoukyouTime(buffer, choukyou, offset, this.hanroFurlongOffsets);
    } else if ($CH.ChoukyouType.Shiba <= choukyou.Type || choukyou.Type <= $CH.ChoukyouType.Shougai) {
      await this.saveChoukyouTime(buffer, choukyou, offset, this.courseFurlongOffsets);
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