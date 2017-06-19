import { Service } from "typedi";
import { Repository } from "typeorm";
import { OrmRepository } from "typeorm-typedi-extensions";
import { Uma } from "../entities/Uma";

@Service()
export class UmaDao {

  @OrmRepository(Uma)
  private repository: Repository<Uma>;

  protected getUma(uma: Uma) {
    return this.repository
      .createQueryBuilder("u")
      .where("u.Bamei = :bamei")
      .setParameter("bamei", uma.Bamei)
      .andWhere("u.Seibetsu = :seibetsu")
      .setParameter("seibetsu", uma.Seibetsu)
      .getOne();
  }

  public async saveUma(toBe: Uma) {
    if (toBe.Id) {
      return toBe;
    }
    const asIs = await this.getUma(toBe);
    if (asIs) {
      let update = false;
      let insert = false;
      /* tslint:disable:triple-equals */
      if (toBe.Banushi) {
        if (!asIs.Banushi) {
          asIs.Banushi = toBe.Banushi;
          update = true;
        } else if (asIs.Banushi.Id !== toBe.Banushi.Id) {
          asIs.Banushi = toBe.Banushi;
          insert = true;
        }
      }
      if (toBe.Kyuusha) {
        if (!asIs.Kyuusha) {
          asIs.Kyuusha = toBe.Kyuusha;
          update = true;
        } else if (asIs.Kyuusha.Id !== toBe.Kyuusha.Id) {
          asIs.Kyuusha = toBe.Kyuusha;
          insert = true;
        }
      }
      if (asIs.Seinengappi == null && toBe.Seinengappi != null) {
        asIs.Seinengappi = toBe.Seinengappi;
        update = true;
      }
      if (asIs.Keiro == null && toBe.Keiro != null) {
        asIs.Keiro = toBe.Keiro;
        update = true;
      }
      if (asIs.Kesshu == null && toBe.Kesshu != null) {
        asIs.Kesshu = toBe.Kesshu;
        update = true;
      }
      if (asIs.Sanchi == null && toBe.Sanchi != null) {
        asIs.Sanchi = toBe.Sanchi;
        update = true;
      }
      if (asIs.UmaKigou == null && toBe.UmaKigou != null) {
        asIs.UmaKigou = toBe.UmaKigou;
        update = true;
      }
      if (asIs.ChichiUma == null && toBe.ChichiUma != null) {
        asIs.ChichiUma = toBe.ChichiUma;
        update = true;
      }
      if (asIs.HahaUma == null && toBe.HahaUma != null) {
        asIs.HahaUma = toBe.HahaUma;
        update = true;
      }
      if (asIs.Seisansha == null && toBe.Seisansha != null) {
        asIs.Seisansha = toBe.Seisansha;
        update = true;
      }
      if (asIs.KoueiGaikokuKyuushaMei == null && toBe.KoueiGaikokuKyuushaMei != null) {
        asIs.KoueiGaikokuKyuushaMei = toBe.KoueiGaikokuKyuushaMei;
        update = true;
      }
      if (asIs.MasshouFlag == null && toBe.MasshouFlag != null) {
        asIs.MasshouFlag = toBe.MasshouFlag;
        update = true;
      }
      if (asIs.MasshouNengappi == null && toBe.MasshouNengappi != null) {
        asIs.MasshouNengappi = toBe.MasshouNengappi;
        update = true;
      }
      if (asIs.Jiyuu == null && toBe.Jiyuu != null) {
        asIs.Jiyuu = toBe.Jiyuu;
        update = true;
      }
      if (asIs.Ikisaki == null && toBe.Ikisaki != null) {
        asIs.Ikisaki = toBe.Ikisaki;
        update = true;
      }
      if (asIs.ShibouNen == null && toBe.ShibouNen != null) {
        asIs.ShibouNen = toBe.ShibouNen;
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
      if (insert) {
        return await this.repository.save(asIs);
      }
      if (update) {
        await this.repository.updateById(asIs.Id, asIs);
      }
      toBe = asIs;
    } else {
      toBe = await this.repository.save(toBe);
    }
    return toBe;
  }

}