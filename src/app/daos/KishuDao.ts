import { Service } from "typedi";
import { Repository } from "typeorm";
import { OrmRepository } from "typeorm-typedi-extensions";
import { KijouKishu } from "../entities/KijouKishu";
import { Kishu } from "../entities/Kishu";
import { KishuShozoku } from "../entities/KishuShozoku";

@Service()
export class KishuDao {

  @OrmRepository(Kishu)
  private kishuRepository: Repository<Kishu>;

  @OrmRepository(KijouKishu)
  private kijouKishuRepository: Repository<KijouKishu>;

  @OrmRepository(KishuShozoku)
  private kishuShozokuRepository: Repository<KishuShozoku>;

  protected getTime(date: any) {
    if (date.getTime) {
      return (<Date>date).getTime();
    } else {
      return Date.parse(date);
    }
  }

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
        const fromDiff = this.getTime(item.FromDate) - this.getTime(kishu.FromDate);
        if (fromDiff < diff) {
          diff = fromDiff;
          result = item;
        }
      } else if (item.ToDate < kishu.ToDate) {
        const toDiff = this.getTime(kishu.ToDate) - this.getTime(item.ToDate);
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

  protected getKishuShozoku(kishuShozoku: KishuShozoku) {
    const qb = this.kishuShozokuRepository
      .createQueryBuilder("ks")
      .where("1 = 1");
    /* tslint:disable:triple-equals */
    if (kishuShozoku.ShozokuBasho != null) {
      qb.andWhere("ks.ShozokuBasho = :shozokuBasho")
        .setParameter("shozokuBasho", kishuShozoku.ShozokuBasho);
    } else {
      qb.andWhere("ks.ShozokuBasho IS NULL");
    }
    if (kishuShozoku.TouzaiBetsu != null) {
      qb.andWhere("ks.TouzaiBetsu = :touzaiBetsu")
        .setParameter("touzaiBetsu", kishuShozoku.TouzaiBetsu);
    } else {
      qb.andWhere("ks.TouzaiBetsu IS NULL");
    }
    if (kishuShozoku.Kyuusha) {
      qb.andWhere("ks.KyuushaId = :KyuushaId")
        .setParameter("KyuushaId", kishuShozoku.Kyuusha.Id);
    } else {
      qb.andWhere("ks.KyuushaId IS NULL");
    }
    return qb.getOne();
  }

  protected getKijouKishu(kijouKishu: KijouKishu) {
    return this.kijouKishuRepository
      .createQueryBuilder("kk")
      .where("kk.KishuId = :kishuId")
      .setParameter("kishuId", kijouKishu.Kishu.Id)
      .andWhere("kk.KishuShozokuId = :kishuShozokuId")
      .setParameter("kishuShozokuId", kijouKishu.KishuShozoku.Id)
      .andWhere("kk.MinaraiKubun = :minaraiKubun")
      .setParameter("minaraiKubun", kijouKishu.MinaraiKubun)
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
      if (update) {
        await this.kishuRepository.updateById(asIs.Id, asIs);
      }
      toBe = asIs;
    } else {
      toBe = await this.kishuRepository.save(toBe);
    }
    return toBe;
  }

  protected async saveKishuShozoku(toBe: KishuShozoku) {
    const asIs = await this.getKishuShozoku(toBe);
    if (asIs) {
      toBe = asIs;
    } else {
      toBe = await this.kishuShozokuRepository.save(toBe);
    }
    return toBe;
  }

  public async saveKijouKishu(kishu: Kishu, kishuShozoku: KishuShozoku, minaraiKubun: number) {
    let toBe = new KijouKishu();
    kishu = await this.saveKishu(kishu);
    toBe.Kishu = kishu;
    kishuShozoku = await this.saveKishuShozoku(kishuShozoku);
    toBe.KishuShozoku = kishuShozoku;
    toBe.MinaraiKubun = minaraiKubun;
    const asIs = await this.getKijouKishu(toBe);
    if (asIs) {
      toBe = asIs;
    } else {
      toBe = await this.kijouKishuRepository.save(toBe);
    }
    toBe.Kishu = kishu;
    toBe.KishuShozoku = kishuShozoku;
    return toBe;
  }

}