import { findBy, findOneBy, getOrCreate, query } from "../db/helpers";
import { MeishouKubun } from "../entities/MeishouKubun";
import { Seisanba } from "../entities/Seisanba";
import { Seisansha } from "../entities/Seisansha";
import { SeisanshaMei } from "../entities/SeisanshaMei";
import { Uma } from "../entities/Uma";
import { tool } from "../reader/Tool";
import { meishouDao, normalizeMeishou } from "./MeishouDao";

/** 生産者の保存に渡す値。名前 (正式名・略称・フリガナ・欧字) は SeisanshaMei に保存する */
export type SeisanshaToBe = Partial<Omit<Seisansha, "Id">> & {
  meishou?: string | null;
  tanshuku?: string | null;
  furigana?: string | null;
  eigo?: string | null;
};

export class SeisanshaDao {
  /** その区分の名前 (表記が同じもの) を持つ生産者 */
  private findByMeishou(kubun: MeishouKubun, meishou: string) {
    return query<Seisansha>(
      `SELECT DISTINCT s.* FROM Seisansha s
        INNER JOIN SeisanshaMei m ON m.SeisanshaId = s.Id
        INNER JOIN Shoyuu y ON y.Id = m.ShoyuuId
        WHERE m.Kubun = ? AND y.Meishou = ?`,
      kubun,
      normalizeMeishou(kubun, meishou),
    );
  }

  /**
   * 名前で当たった生産者から選ぶ。コードを持つ生産者どうしは別の生産者なので、
   * コードがあるなら、まだコードのない生産者だけを採る (名前だけで登録した生産者にコードを付ける)。
   * コードがないなら、候補がひとりならその生産者、複数ならコードのない生産者 (onlyOne なら選ばない)。
   */
  private choose(candidates: Seisansha[], code: string | null | undefined, onlyOne: boolean) {
    if (!code && candidates.length === 1) {
      return candidates[0];
    }
    if (!code && onlyOne) {
      return null;
    }
    return candidates.find((c) => c.JvDataCode == null) ?? null;
  }

  /**
   * 既存の生産者を探します。コードが一致すればその生産者、なければ正式名が同じ生産者、
   * 正式名がなければ略称が同じ生産者です (略称は別の生産者と重なりやすいので、候補がひとりのときだけ)。
   */
  private getSeisansha(toBe: SeisanshaToBe) {
    if (toBe.JvDataCode) {
      const found = findOneBy(Seisansha, { JvDataCode: toBe.JvDataCode });
      if (found) {
        return found;
      }
    }
    if (toBe.meishou) {
      return this.choose(
        this.findByMeishou(MeishouKubun.Meishou, toBe.meishou),
        toBe.JvDataCode,
        false,
      );
    }
    if (toBe.tanshuku) {
      return this.choose(
        this.findByMeishou(MeishouKubun.Tanshuku, toBe.tanshuku),
        toBe.JvDataCode,
        true,
      );
    }
    return null;
  }

  private async saveMei(seisanshaId: number, kubun: MeishouKubun, meishou: string) {
    const shoyuu = await meishouDao.save(kubun, meishou);
    getOrCreate(SeisanshaMei, { SeisanshaId: seisanshaId, ShoyuuId: shoyuu.Id, Kubun: kubun }, [
      "SeisanshaId",
      "ShoyuuId",
      "Kubun",
    ]);
  }

  private link(umaId: number, seisanshaId: number) {
    return getOrCreate(Seisanba, { UmaId: umaId, SeisanshaId: seisanshaId }, [
      "UmaId",
      "SeisanshaId",
    ]);
  }

  /**
   * 生産者を保存し、名前を足します。正式名も略称もなければ保存せず null です (生産者は名前を必ず持つ)。
   * コードがあれば、そのコードを持つ馬 (産駒マスタの馬など) を生産者につなぎます。
   */
  public async saveSeisansha(toBe: SeisanshaToBe) {
    const { meishou, tanshuku, furigana, eigo, ...values } = toBe;
    if (!meishou && !tanshuku) {
      return null;
    }
    const seisansha = await tool.saveOrUpdate(
      Seisansha,
      this.getSeisansha(toBe),
      values as Seisansha,
    );
    const names: [MeishouKubun, string | null | undefined][] = [
      [MeishouKubun.Meishou, meishou],
      [MeishouKubun.Tanshuku, tanshuku],
      [MeishouKubun.Furigana, furigana],
      [MeishouKubun.Eigo, eigo],
    ];
    for (const [kubun, name] of names) {
      if (name) {
        await this.saveMei(seisansha.Id, kubun, name);
      }
    }
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
    const seisansha =
      toBe.meishou || toBe.tanshuku
        ? await this.saveSeisansha(toBe)
        : toBe.JvDataCode
          ? findOneBy(Seisansha, { JvDataCode: toBe.JvDataCode })
          : null;
    return seisansha ? this.link(umaId, seisansha.Id) : null;
  }
}

export const seisanshaDao = new SeisanshaDao();
