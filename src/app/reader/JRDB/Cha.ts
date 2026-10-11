import { Inject, Service } from "typedi";
import * as $CH from "../../converters/Choukyou";
import * as $R from "../../converters/Race";
import { ChoukyouDao } from "../../daos/ChoukyouDao";
import { Choukyou } from "../../entities/Choukyou";
import { Kyousouba } from "../../entities/Kyousouba";
import { Shussouba } from "../../entities/Shussouba";
import { ShussoubaChoukyou } from "../../entities/ShussoubaChoukyou";
import { readInt, readPositiveDouble, readPositiveInt } from "../Reader";
import { getChoukyouId } from "../Tool";
import { JrdbShussoubaData } from "./JrdbShussoubaData";

/** 調教本追切データ。本追切の調教を Choukyou に入れ、出走馬と本追切として結びつける */
@Service()
export class Cha extends JrdbShussoubaData {
  @Inject()
  private choukyouDao: ChoukyouDao;

  protected getBufferLength() {
    return 64;
  }

  protected async saveShussoubaRelated(buffer: Buffer, shussouba: Shussouba) {
    await super.saveShussoubaRelated(buffer, shussouba);
    const choukyou = await this.saveChoukyou(buffer, shussouba);
    if (!choukyou) {
      return;
    }
    const sc = new ShussoubaChoukyou();
    sc.ShussoubaId = shussouba.Id;
    sc.ChoukyouId = choukyou.Id;
    sc.HonOikiri = 1;
    await this.choukyouDao.saveShussoubaChoukyou(sc);
  }

  protected async saveChoukyou(buffer: Buffer, shussouba: Shussouba) {
    const days = this.tool.getDaysFrom1970(buffer, 12);
    if (days === null || shussouba.KyousoubaId == null) {
      return null;
    }
    const kyousouba = await this.entityManager.findOneBy(Kyousouba, {
      Id: shussouba.KyousoubaId,
    });
    if (!kyousouba) {
      return null;
    }

    const toBe = new Choukyou();
    toBe.UmaId = kyousouba.UmaId;
    toBe.Nengappi = readInt(buffer, 12, 8);
    toBe.Kaisuu = readPositiveInt(buffer, 20, 1);
    toBe.Basho = $CH.basho.toCodeFromJrdb(buffer, 21, 2);
    toBe.Type = $CH.type.toCodeFromJrdb(buffer, 21, 2);
    toBe.Course = $CH.course.toCodeFromJrdb(buffer, 21, 2);
    toBe.Oikiri = $CH.oikiri.toCodeFromJrdb(buffer, 23, 1);
    toBe.OiJoutai = $CH.oiJoutai.toCodeFromJrdb(buffer, 24, 2);
    toBe.Noriyaku = $CH.noriyaku.toCodeFromJrdb(buffer, 26, 1);
    toBe.ChoukyouF = readPositiveInt(buffer, 27, 1);
    toBe.TenF = readPositiveDouble(buffer, 28, 3, 0.1);
    toBe.ChuukanF = readPositiveDouble(buffer, 31, 3, 0.1);
    toBe.ShimaiF = readPositiveDouble(buffer, 34, 3, 0.1);
    toBe.TenFShisuu = readInt(buffer, 37, 3);
    toBe.ChuukanFShisuu = readInt(buffer, 40, 3);
    toBe.ShimaiFShisuu = readInt(buffer, 43, 3);
    const oikiriShisuu = readInt(buffer, 46, 3);
    if (oikiriShisuu) {
      toBe.OikiriShisuu = oikiriShisuu;
    }
    toBe.AwaseKekka = $CH.awaseKekka.toCodeFromJrdb(buffer, 49, 1);
    toBe.AwaseUmaOikiriShurui = $CH.oikiri.toCodeFromJrdb(buffer, 50, 1);
    toBe.AwaseUmaNenrei = readPositiveInt(buffer, 51, 2);
    toBe.AwaseUmaClass = $R.jouken.toCodeFromJrdb(buffer, 53, 2);

    // KOL から入った同じ馬・同じ日・同じ場所・同じ種別の調教があれば、そこに本追切の項目を足す。
    // 複数あれば追切種類が同じものを選ぶ(JRDB には KOL と突き合わせられる時計がないため)。
    const candidates: Choukyou[] = [];
    for (let renban = 1; renban <= 4; renban++) {
      const id = getChoukyouId(toBe.UmaId, days, toBe.Basho, toBe.Type, renban);
      const c = await this.entityManager.findOneBy(Choukyou, { Id: id });
      if (!c) {
        break;
      }
      candidates.push(c);
    }
    const asIs = candidates.find((c) => c.Oikiri === toBe.Oikiri) ?? candidates[0] ?? null;
    toBe.Renban = asIs?.Renban ?? 1;
    toBe.Id = getChoukyouId(toBe.UmaId, days, toBe.Basho, toBe.Type, toBe.Renban);
    return await this.tool.saveOrUpdate(Choukyou, asIs, toBe, true);
  }
}
