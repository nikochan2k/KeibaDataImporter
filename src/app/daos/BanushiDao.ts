import { findOneBy, upsert } from "../db/helpers";
import { Banushi } from "../entities/Banushi";
import { BanushiMei } from "../entities/BanushiMei";
import { Kyousouba } from "../entities/Kyousouba";
import { Shussouba } from "../entities/Shussouba";
import { UmaBanushi } from "../entities/UmaBanushi";
import { getNengappiOfShussoubaId } from "../reader/ShussoubaTool";
import { ShoyuushaDao, type ShoyuushaToBe } from "./ShoyuushaDao";

/** 馬主の保存に渡す値。名前 (正式名・略称・フリガナ・欧字) は BanushiMei に保存する */
export type BanushiToBe = ShoyuushaToBe<Banushi>;

export class BanushiDao {
  private readonly shoyuusha = new ShoyuushaDao(Banushi, BanushiMei, "BanushiId");

  /** 馬主を保存し、名前を足します。正式名も略称もなければ保存せず null です (馬主は名前を必ず持つ)。 */
  public saveBanushi(toBe: BanushiToBe) {
    return this.shoyuusha.save(toBe);
  }

  /** 馬主を保存し、その日 (yyyymmdd) の馬の馬主にします */
  public async saveUmaBanushi(umaId: number, nengappi: number, toBe: BanushiToBe) {
    const banushi = await this.saveBanushi(toBe);
    if (!banushi) {
      return null;
    }
    return upsert(UmaBanushi, { UmaId: umaId, Nengappi: nengappi, BanushiId: banushi.Id });
  }

  /** 馬主を保存し、レースの日の、出走馬の馬の馬主にします。馬が分からなければ馬主だけを保存します */
  public async saveShussoubaBanushi(
    shussouba: Pick<Shussouba, "Id" | "KyousoubaId">,
    toBe: BanushiToBe,
  ) {
    const kyousouba = shussouba.KyousoubaId
      ? findOneBy(Kyousouba, { Id: shussouba.KyousoubaId })
      : null;
    if (!kyousouba) {
      return this.saveBanushi(toBe);
    }
    return this.saveUmaBanushi(kyousouba.UmaId, getNengappiOfShussoubaId(shussouba.Id), toBe);
  }
}

export const banushiDao = new BanushiDao();
