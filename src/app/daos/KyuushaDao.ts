import { Service } from "typedi";
import { EntityManager, Repository } from "typeorm";
import { OrmEntityManager, OrmRepository } from "typeorm-typedi-extensions";
import { Kyuusha } from "../entities/Kyuusha";

@Service()
export class KyuushaDao {

  @OrmEntityManager()
  protected entityManager: EntityManager;

  @OrmRepository(Kyuusha)
  private repository: Repository<Kyuusha>;

  protected getKyuusha(kyuusha: Kyuusha) {
    if (kyuusha.KolKyuushaCode) {
      return this.repository.findOne({ KolKyuushaCode: kyuusha.KolKyuushaCode });
    }
    if (kyuusha.JrdbKyuushaCode) {
      return this.repository.findOne({ JrdbKyuushaCode: kyuusha.JrdbKyuushaCode });
    }
    return null;
  }

  public async saveKyuusha(toBe: Kyuusha) {
    if (!toBe.KolKyuushaCode && !toBe.JrdbKyuushaCode) {
      return null;
    }
    const asIs = await this.getKyuusha(toBe);
    if (asIs) {
      const updateSet: any = {};
      /* tslint:disable:triple-equals */
      if (asIs.KolKyuushaCode == null && toBe.KolKyuushaCode != null) {
        updateSet.KolKyuushaCode = asIs.KolKyuushaCode = toBe.KolKyuushaCode;
      }
      if (asIs.JrdbKyuushaCode == null && toBe.JrdbKyuushaCode != null) {
        updateSet.JrdbKyuushaCode = asIs.JrdbKyuushaCode = toBe.JrdbKyuushaCode;
      }
      if (asIs.KyuushaMei == null && toBe.KyuushaMei != null) {
        updateSet.KyuushaMei = asIs.KyuushaMei = toBe.KyuushaMei;
      }
      if (asIs.TanshukuKyuushaMei == null && toBe.KyuushaMei != null) {
        updateSet.TanshukuKyuushaMei = asIs.TanshukuKyuushaMei = toBe.TanshukuKyuushaMei;
      }
      if (asIs.Furigana == null && toBe.Furigana != null) {
        updateSet.Furigana = asIs.Furigana == toBe.Furigana;
      }
      if (asIs.Seinengappi == null && toBe.Seinengappi != null) {
        updateSet.Seinengappi = asIs.Seinengappi = toBe.Seinengappi;
      }
      if (asIs.HatsuMenkyoNen == null && toBe.HatsuMenkyoNen != null) {
        updateSet.HatsuMenkyoNen = asIs.HatsuMenkyoNen = toBe.HatsuMenkyoNen;
      }
      if (asIs.TouzaiBetsu == null && toBe.TouzaiBetsu != null) {
        updateSet.TouzaiBetsu = asIs.TouzaiBetsu = toBe.TouzaiBetsu;
      }
      if (asIs.ShozokuBasho == null && toBe.ShozokuBasho != null) {
        updateSet.ShozokuBasho = asIs.ShozokuBasho = toBe.ShozokuBasho;
      }
      if (asIs.RitsuHokuNanBetsu == null && toBe.RitsuHokuNanBetsu != null) {
        updateSet.RitsuHokuNanBetsu = asIs.RitsuHokuNanBetsu = toBe.RitsuHokuNanBetsu;
      }
      /* tslint:enable:triple-equals */
      if (0 < Object.keys(updateSet).length) {
        await this.entityManager
          .createQueryBuilder()
          .update(Kyuusha, updateSet)
          .where("Id = :id")
          .setParameter("id", asIs.Id)
          .execute();
      }
      toBe = asIs;
    } else {
      toBe = await this.repository.save(toBe);
    }
    return toBe;
  }

}