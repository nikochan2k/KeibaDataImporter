import { Service } from "typedi";
import { Repository } from "typeorm";
import { OrmRepository } from "typeorm-typedi-extensions";
import { Kijou } from "../entities/Kijou";
import { Kishu } from "../entities/Kishu";
import { Shozoku } from "../entities/Shozoku";

@Service()
export class KishuDao {

  @OrmRepository(Kishu)
  private kishuRepository: Repository<Kishu>;

  @OrmRepository(Kijou)
  private kijouRepository: Repository<Kijou>;

  @OrmRepository(Shozoku)
  private shozokuRepository: Repository<Shozoku>;

  protected async getKishu(kishu: Kishu) {
    let result: Kishu;
    if (kishu.KishuMei) {
      result = await this.kishuRepository.findOne({ KishuMei: kishu.KishuMei });
    }
    if (result) {
      return result;
    }

    const list = await this.kishuRepository.find({ TanshukuKishuMei: kishu.TanshukuKishuMei });
    const length = list.length;
    if (length === 0) {
      return null;
    }
    if (length === 1) {
      return list[0];
    }

    let diff = Number.MAX_VALUE;
    for (let i = 0; i < length; i++) {
      const item = list[i];
      if (kishu.FromDate < item.FromDate) {
        const fromDiff = item.FromDate - kishu.FromDate;
        if (fromDiff < diff) {
          diff = fromDiff;
          result = item;
        }
      } else if (item.ToDate < kishu.ToDate) {
        const toDiff = kishu.ToDate - item.ToDate;
        if (toDiff < diff) {
          diff = toDiff;
          result = item;
        }
      } else {
        return item;
      }
    }
    return result;
  }

  protected getShozoku(shozoku: Shozoku) {
    const qb = this.shozokuRepository
      .createQueryBuilder("k")
      .where("1 = 1");
    /* tslint:disable:triple-equals */
    if (shozoku.ShozokuBasho != null) {
      qb.andWhere("k.ShozokuBasho = :shozokuBasho")
        .setParameter("shozokuBasho", shozoku.ShozokuBasho);
    } else {
      qb.andWhere("k.ShozokuBasho IS NULL");
    }
    if (shozoku.TouzaiBetsu != null) {
      qb.andWhere("k.TouzaiBetsu = :touzaiBetsu")
        .setParameter("touzaiBetsu", shozoku.TouzaiBetsu);
    } else {
      qb.andWhere("k.TouzaiBetsu IS NULL");
    }
    if (shozoku.KyuushaId) {
      qb.andWhere("k.KyuushaId = :KyuushaId")
        .setParameter("KyuushaId", shozoku.KyuushaId);
    } else {
      qb.andWhere("k.KyuushaId IS NULL");
    }
    return qb.getOne();
  }

  protected getKijou(kijou: Kijou) {
    return this.kijouRepository
      .createQueryBuilder("k")
      .where("k.KishuId = :kishuId")
      .setParameter("kishuId", kijou.KishuId)
      .andWhere("k.ShozokuId = :shozokuId")
      .setParameter("shozokuId", kijou.ShozokuId)
      .andWhere("k.MinaraiKubun = :minaraiKubun")
      .setParameter("minaraiKubun", kijou.MinaraiKubun)
      .getOne();
  }

  public async saveKishu(toBe: Kishu) {
    if (3 < toBe.TanshukuKishuMei.length) {
      toBe.TanshukuKishuMei = toBe.TanshukuKishuMei.substring(0, 3);
    }
    const asIs = await this.getKishu(toBe);
    if (asIs) {
      let update = false;
      /* tslint:disable:triple-equals */
      if (toBe.FromDate < asIs.FromDate) {
        asIs.FromDate = toBe.FromDate;
        update = true;
      }
      if (asIs.ToDate < toBe.ToDate) {
        asIs.ToDate = toBe.ToDate;
        update = true;
      }
      if (asIs.KishuMei == null && toBe.KishuMei != null) {
        asIs.KishuMei = toBe.KishuMei;
        update = true;
      }
      if (asIs.Furigana == null && toBe.Furigana != null) {
        asIs.Furigana = toBe.Furigana;
        update = true;
      }
      if (asIs.KolKishuCode == null && toBe.KolKishuCode != null) {
        asIs.KolKishuCode = toBe.KolKishuCode;
        update = true;
      }
      if (asIs.JrdbKishuCode == null && toBe.JrdbKishuCode != null) {
        asIs.JrdbKishuCode = toBe.JrdbKishuCode;
        update = true;
      }
      if (asIs.Seinengappi == null && toBe.Seinengappi != null) {
        asIs.Seinengappi = toBe.Seinengappi;
        update = true;
      }
      if (asIs.HatsuMenkyoNen == null && toBe.HatsuMenkyoNen != null) {
        asIs.HatsuMenkyoNen = toBe.HatsuMenkyoNen;
        update = true;
      }
      /* tslint:enable:triple-equals */
      toBe = update ? await this.kishuRepository.save(asIs) : asIs;
    } else {
      toBe = await this.kishuRepository.save(toBe);
    }
    return toBe;
  }

  protected async saveShozoku(toBe: Shozoku) {
    const asIs = await this.getShozoku(toBe);
    if (asIs) {
      toBe = asIs;
    } else {
      toBe = await this.shozokuRepository.save(toBe);
    }
    return toBe;
  }

  public async saveKijou(kishu: Kishu, shozoku: Shozoku, minaraiKubun: number) {
    let toBe = new Kijou();
    kishu = await this.saveKishu(kishu);
    toBe.KishuId = kishu.Id;
    shozoku = await this.saveShozoku(shozoku);
    toBe.ShozokuId = shozoku.Id;
    toBe.MinaraiKubun = minaraiKubun;
    const asIs = await this.getKijou(toBe);
    if (asIs) {
      toBe = asIs;
    } else {
      toBe = await this.kijouRepository.save(toBe);
    }
    return toBe;
  }

}