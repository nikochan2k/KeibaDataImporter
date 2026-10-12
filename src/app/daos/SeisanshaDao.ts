import { findBy, findOneBy, getOrCreate } from "../db/helpers";
import { Seisanba } from "../entities/Seisanba";
import { Seisansha } from "../entities/Seisansha";
import { MeishouKubun } from "../entities/Shoyuu";
import { Uma } from "../entities/Uma";
import { tool } from "../reader/Tool";
import { meishouDao } from "./MeishouDao";

/** 生産者の保存に渡す値。名前 (meishou) は Shoyuu に保存する */
export type SeisanshaToBe = Partial<Omit<Seisansha, "Id" | "ShoyuuId">> & {
  meishou?: string | null;
  kubun?: MeishouKubun;
};

export class SeisanshaDao {
  /**
   * 既存の生産者を探します。コードが一致すればその生産者、なければ名前が同じ生産者です。
   * 名前で探すときは、コードを持つ生産者どうしは別の生産者なので、
   * コードがあるなら、まだコードのない生産者だけを採ります (名前だけで登録した生産者にコードを付ける)。
   * コードがないなら、同じ名前の生産者がひとりならその生産者、複数ならコードのない生産者を採ります。
   */
  private getSeisansha(code: string | null | undefined, shoyuuId: number) {
    if (code) {
      const found = findOneBy(Seisansha, { JvDataCode: code });
      if (found) {
        return found;
      }
    }
    const candidates = findBy(Seisansha, { ShoyuuId: shoyuuId });
    if (!code && candidates.length === 1) {
      return candidates[0];
    }
    return candidates.find((c) => c.JvDataCode == null) ?? null;
  }

  private link(umaId: number, seisanshaId: number) {
    return getOrCreate(Seisanba, { UmaId: umaId, SeisanshaId: seisanshaId }, [
      "UmaId",
      "SeisanshaId",
    ]);
  }

  /**
   * 生産者を保存します。名前がなければ保存せず null です。
   * コードがあれば、そのコードを持つ馬 (産駒マスタの馬など) を生産者につなぎます。
   */
  public async saveSeisansha({ meishou, kubun = MeishouKubun.Full, ...values }: SeisanshaToBe) {
    if (!meishou) {
      return null;
    }
    const shoyuu = await meishouDao.save(kubun, meishou);
    const toBe = { ...values, ShoyuuId: shoyuu.Id } as Seisansha;
    const seisansha = await tool.saveOrUpdate(
      Seisansha,
      this.getSeisansha(values.JvDataCode, shoyuu.Id),
      toBe,
    );
    if (values.JvDataCode) {
      for (const uma of findBy(Uma, { JvDataSeisanshaCode: values.JvDataCode })) {
        this.link(uma.Id, seisansha.Id);
      }
    }
    return seisansha;
  }

  /**
   * 馬の生産者を保存し、馬につなぎます。
   * 名前がなくコードだけなら、そのコードの生産者がいるときだけつなぎます
   * (いなければ、生産者マスタを取り込んだときに Uma.JvDataSeisanshaCode でつながる)。
   */
  public async saveSeisanba(umaId: number, toBe: SeisanshaToBe) {
    const seisansha = toBe.meishou
      ? await this.saveSeisansha(toBe)
      : toBe.JvDataCode
        ? findOneBy(Seisansha, { JvDataCode: toBe.JvDataCode })
        : null;
    return seisansha ? this.link(umaId, seisansha.Id) : null;
  }
}

export const seisanshaDao = new SeisanshaDao();
