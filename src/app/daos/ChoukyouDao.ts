import { findBy, findOneBy, save, upsertAll } from "../db/helpers";
import { Choukyou } from "../entities/Choukyou";
import { ChoukyouTime } from "../entities/ChoukyouTime";
import { ShussoubaChoukyou } from "../entities/ShussoubaChoukyou";
import { getChoukyouId, tool } from "../reader/Tool";

export class ChoukyouDao {
  /**
   * 調教 1 本を、時計と一緒に保存します。
   * 同じ馬・同じ日・同じ場所・同じ種別の調教のうち、同じ調教 (findRenban) があればその行に足し、なければ新しい連番の行にします。
   * KOL・JV-Data のどちらから取り込んでも、同じ調教は同じ行になります。
   */
  public saveChoukyou(choukyou: Choukyou, days: number, times: ChoukyouTime[]) {
    choukyou.Renban = this.findRenban(choukyou, days, times);
    choukyou.Id = getChoukyouId(
      choukyou.UmaId,
      days,
      choukyou.Basho,
      choukyou.Type,
      choukyou.Renban,
    );
    save(Choukyou, choukyou);
    for (const choukyouTime of times) {
      choukyouTime.ChoukyouId = choukyou.Id;
    }
    upsertAll(ChoukyouTime, times);
    return choukyou;
  }

  /**
   * 同じ馬・同じ日・同じ場所・同じ種別の調教が既にあれば、同じ調教かどうかを比べて連番を決めます。
   * 同じ調教はレースごとのファイル(DEN2/SEI2/UMA)や別のデータ元に何度も出てくるため、同じ内容ならその連番を使い、
   * 違う内容なら空いている次の連番を使います。
   */
  private findRenban(choukyou: Choukyou, days: number, times: ChoukyouTime[]) {
    const { UmaId, Basho, Type } = choukyou;
    for (let renban = 1; renban <= 4; renban++) {
      const id = getChoukyouId(UmaId, days, Basho, Type, renban);
      const asIs = findOneBy(Choukyou, { Id: id });
      if (!asIs) {
        return renban;
      }
      const asIsTimes = findBy(ChoukyouTime, { ChoukyouId: id });
      if (this.isSameChoukyou(asIs, asIsTimes, choukyou, times)) {
        return renban;
      }
    }
    throw new Error(
      `同じ馬・同じ日・同じ場所・同じ種別の調教が多すぎます: ${JSON.stringify({ UmaId, days, Basho, Type })}`,
    );
  }

  /**
   * 調教の中身で同じ調教かを判定します。
   * 片方にしかない項目や時計は比べません(JRDB の本追切から作った調教には馬場や時計がなく、
   * KOL と JV-Data では、時計のあるハロンが違うことがあるため)。
   * 乗り役・併せはレース(出走馬)ごとに変わりうるので比べません。
   */
  private isSameChoukyou(
    asIs: Choukyou,
    asIsTimes: ChoukyouTime[],
    toBe: Choukyou,
    toBeTimes: ChoukyouTime[],
  ) {
    const keys: (keyof Choukyou)[] = [
      "Jikoku",
      "Course",
      "MigiHidari",
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
    // Time は real 型で精度が落ちるため 0.1 秒単位に丸めて比べる
    const toKey = (t: ChoukyouTime) =>
      `${t.Time == null ? "" : Math.round(t.Time * 10)}:${t.Comment ?? ""}`;
    const asIsByF = new Map(asIsTimes.map((t) => [t.F, toKey(t)]));
    return toBeTimes.every((t) => !asIsByF.has(t.F) || asIsByF.get(t.F) === toKey(t));
  }

  /**
   * 出走馬と調教を結びつけます。同じ出走馬・同じ調教の行があれば更新し(null では消さない)、
   * なければ出走馬ごとの空いている連番で作ります。
   */
  public async saveShussoubaChoukyou(toBe: ShussoubaChoukyou) {
    const list = await findBy(ShussoubaChoukyou, {
      ShussoubaId: toBe.ShussoubaId,
    });
    const asIs = list.find((sc) => sc.ChoukyouId === toBe.ChoukyouId);
    if (asIs) {
      toBe.Id = asIs.Id;
      return await tool.saveOrUpdate(ShussoubaChoukyou, asIs, toBe, true);
    }
    const used = new Set(list.map((sc) => sc.Id));
    for (let i = 0; i < 2 ** 3; i++) {
      const id = toBe.ShussoubaId * 2 ** 3 + i;
      if (!used.has(id)) {
        toBe.Id = id;
        return await tool.saveOrUpdate(ShussoubaChoukyou, null, toBe);
      }
    }
    throw new Error(`出走馬に結びつく調教が多すぎます: ShussoubaId=${toBe.ShussoubaId}`);
  }
}

export const choukyouDao = new ChoukyouDao();
