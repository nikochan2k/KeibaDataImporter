import { findBy, getOrCreate } from "../db/helpers";
import { Seisanba } from "../entities/Seisanba";
import { Seisansha } from "../entities/Seisansha";
import { SeisanshaMei } from "../entities/SeisanshaMei";
import { Uma } from "../entities/Uma";
import { ShoyuushaDao, type ShoyuushaToBe } from "./ShoyuushaDao";

/** 生産者の保存に渡す値。名前 (正式名・略称・フリガナ・欧字) は SeisanshaMei に保存する */
export type SeisanshaToBe = ShoyuushaToBe<Seisansha>;

export class SeisanshaDao {
  private readonly shoyuusha = new ShoyuushaDao(Seisansha, SeisanshaMei, "SeisanshaId");

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
    const seisansha = await this.shoyuusha.save(toBe);
    if (seisansha && toBe.JvDataCode) {
      for (const uma of findBy(Uma, { JvDataSeisanshaCode: toBe.JvDataCode })) {
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
          ? this.shoyuusha.findByCode(toBe.JvDataCode)
          : null;
    return seisansha ? this.link(umaId, seisansha.Id) : null;
  }
}

export const seisanshaDao = new SeisanshaDao();
