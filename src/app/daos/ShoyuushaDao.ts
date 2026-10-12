import { getTableName } from "drizzle-orm";
import type { SQLiteTable } from "drizzle-orm/sqlite-core";
import { findOneBy, getOrCreate, query, type Where } from "../db/helpers";
import { MeishouKubun } from "../entities/MeishouKubun";
import { tool } from "../reader/Tool";
import { meishouDao, normalizeMeishou } from "./MeishouDao";

/** 名前を持ち、JV-Data のコードで区別できる者 (生産者・馬主) の行 */
interface ShoyuushaRow {
  Id: number;
  JvDataCode: string | null;
}

/** 保存に渡す値。名前 (正式名・略称・フリガナ・欧字) は名前の表に保存する */
export type ShoyuushaToBe<R extends ShoyuushaRow> = Partial<Omit<R, "Id">> & {
  meishou?: string | null;
  tanshuku?: string | null;
  furigana?: string | null;
  eigo?: string | null;
};

/**
 * 生産者・馬主の保存の共通部分。
 * 名前は Shoyuu (名前の辞書) に置き、者と名前を区分ごとにつなぐ表 (SeisanshaMei・BanushiMei) でつなぐ。
 * KOL・JRDB・JRA-VAN からは名前だけ、JV-Data からはコードも分かる。名前で当たった者にコードを付けて、同じ者にまとめる。
 */
export class ShoyuushaDao<M extends SQLiteTable, N extends SQLiteTable> {
  /**
   * @param master 者の表 (Id と JvDataCode を持つ)
   * @param mei 者と名前をつなぐ表 (ShoyuuId・Kubun と、者の Id を指す idColumn を持つ)
   */
  constructor(
    private readonly master: M,
    private readonly mei: N,
    private readonly idColumn: keyof N["$inferSelect"] & string,
  ) {}

  /** その区分の名前 (表記が同じもの) を持つ者 */
  private findByMeishou(kubun: MeishouKubun, meishou: string) {
    return query<ShoyuushaRow>(
      `SELECT DISTINCT s.* FROM "${getTableName(this.master)}" s
        INNER JOIN "${getTableName(this.mei)}" m ON m."${this.idColumn}" = s.Id
        INNER JOIN Shoyuu y ON y.Id = m.ShoyuuId
        WHERE m.Kubun = ? AND y.Meishou = ?`,
      kubun,
      normalizeMeishou(kubun, meishou),
    );
  }

  /**
   * 名前で当たった者から選ぶ。コードを持つ者どうしは別の者なので、
   * コードがあるなら、まだコードのない者だけを採る (名前だけで登録した者にコードを付ける)。
   * コードがないなら、候補がひとりならその者、複数ならコードのない者 (onlyOne なら選ばない)。
   */
  private choose(candidates: ShoyuushaRow[], code: string | null | undefined, onlyOne: boolean) {
    if (!code && candidates.length === 1) {
      return candidates[0];
    }
    if (!code && onlyOne) {
      return null;
    }
    return candidates.find((c) => c.JvDataCode == null) ?? null;
  }

  /** コードの者。いなければ null */
  public findByCode(code: string) {
    return findOneBy(this.master, { JvDataCode: code } as Where<M>) as ShoyuushaRow | null;
  }

  /**
   * 既存の者を探します。コードが一致すればその者、なければ正式名が同じ者、
   * 正式名がなければ略称が同じ者です (略称は別の者と重なりやすいので、候補がひとりのときだけ)。
   */
  private find(toBe: ShoyuushaToBe<ShoyuushaRow>) {
    if (toBe.JvDataCode) {
      const found = this.findByCode(toBe.JvDataCode);
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

  private async saveMei(id: number, kubun: MeishouKubun, meishou: string) {
    const shoyuu = await meishouDao.save(kubun, meishou);
    getOrCreate(
      this.mei,
      { [this.idColumn]: id, ShoyuuId: shoyuu.Id, Kubun: kubun } as N["$inferSelect"],
      [this.idColumn, "ShoyuuId", "Kubun"] as (keyof N["$inferSelect"] & string)[],
    );
  }

  /** 者を保存し、名前を足します。正式名も略称もなければ保存せず null です (者は名前を必ず持つ)。 */
  public async save(toBe: ShoyuushaToBe<M["$inferSelect"] & ShoyuushaRow>) {
    const { meishou, tanshuku, furigana, eigo, ...values } = toBe;
    if (!meishou && !tanshuku) {
      return null;
    }
    type Row = M["$inferSelect"] & ShoyuushaRow;
    const saved = await tool.saveOrUpdate<M, Row>(
      this.master,
      this.find(toBe) as Row,
      values as Row,
    );
    const names: [MeishouKubun, string | null | undefined][] = [
      [MeishouKubun.Meishou, meishou],
      [MeishouKubun.Tanshuku, tanshuku],
      [MeishouKubun.Furigana, furigana],
      [MeishouKubun.Eigo, eigo],
    ];
    for (const [kubun, name] of names) {
      if (name) {
        await this.saveMei(saved.Id, kubun, name);
      }
    }
    return saved;
  }
}
