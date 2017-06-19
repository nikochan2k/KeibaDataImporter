import { Service } from "typedi";
import { Repository } from "typeorm";
import { OrmRepository } from "typeorm-typedi-extensions";
import { Kishu } from "../entities/Kishu";

@Service()
export class KishuDao {

  @OrmRepository(Kishu)
  private repository: Repository<Kishu>;

  protected getKishu(kishu: Kishu) {
    if (!kishu.FromDate || !kishu.ToDate) {
      return null;
    }
    const qb = this.repository
      .createQueryBuilder("k")
      .where("k.KishuMei = :kishuMei")
      .setParameter("kishuMei", kishu.KishuMei)
      .andWhere("k.TanshukuKishuMei = :tanshukuKishuMei")
      .setParameter("tanshukuKishuMei", kishu.TanshukuKishuMei);
    /* tslint:disable:triple-equals */
    if (kishu.TouzaiBetsu != null) {
      qb.andWhere("k.TouzaiBetsu = :touzaiBetsu")
        .setParameter("touzaiBetsu", kishu.TouzaiBetsu);
    } else {
      qb.andWhere("k.TouzaiBetsu IS NULL");
    }
    if (kishu.ShozokuBasho != null) {
      qb.andWhere("k.ShozokuBasho = :shozokuBasho")
        .setParameter("shozokuBasho", kishu.ShozokuBasho);
    } else {
      qb.andWhere("k.ShozokuBasho IS NULL");
    }
    if (kishu.MinaraiKubun != null) {
      qb.andWhere("k.MinaraiKubun = :minaraiKubun")
        .setParameter("minaraiKubun", kishu.MinaraiKubun);
    } else {
      qb.andWhere("k.MinaraiKubun IS NULL");
    }
    if (kishu.Kyuusha) {
      qb.andWhere("k.KyuushaId = :kyuushaId")
        .setParameter("kyuushaId", kishu.Kyuusha.Id);
    } else {
      qb.andWhere("k.KyuushaId IS NULL");
    }
    /* tslint:enable:triple-equals */
    return qb.getOne();
  }

  public async saveKishu(toBe: Kishu) {
    const asIs = await this.getKishu(toBe);
    if (asIs) {
      let update = false;
      /* tslint:disable:triple-equals */
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
      if (asIs.TouzaiBetsu == null && toBe.TouzaiBetsu != null) {
        asIs.TouzaiBetsu = toBe.TouzaiBetsu;
        update = true;
      }
      if (toBe.FromDate < asIs.FromDate) {
        asIs.FromDate = toBe.FromDate;
        update = true;
      }
      if (asIs.ToDate < toBe.ToDate) {
        asIs.ToDate = toBe.ToDate;
        update = true;
      }
      /* tslint:enable:triple-equals */
      if (update) {
        await this.repository.updateById(asIs.Id, asIs);
      }
      toBe = asIs;
    } else {
      try {
        toBe = await this.repository.save(toBe);
      } catch (e) {
        toBe = await this.getKishu(toBe);
      }
    }
    return toBe;
  }

}