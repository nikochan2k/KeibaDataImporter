import { Repository } from "typeorm";
import { Service } from "typedi";
import { OrmRepository } from "typeorm-typedi-extensions";
import { Kyuusha } from "../entities/Kyuusha";

@Service()
export class KyuushaDao {

  @OrmRepository(Kyuusha)
  private repository: Repository<Kyuusha>;

  protected async getKyuusha(kyuusha: Kyuusha) {
    let result: Kyuusha;
    if (kyuusha.KyuushaMei) {
      result = await this.repository.findOne({ KyuushaMei: kyuusha.KyuushaMei });
    }
    if (!result && kyuusha.KolKyuushaCode) {
      result = await this.repository.findOne({ KolKyuushaCode: kyuusha.KolKyuushaCode });
    }
    if (!result && kyuusha.JrdbKyuushaCode) {
      result = await this.repository.findOne({ JrdbKyuushaCode: kyuusha.JrdbKyuushaCode });
    }
    return result;
  }

  public async saveKyuusha(toBe: Kyuusha) {
    if (toBe.Id) {
      return toBe;
    }
    const asIs = await this.getKyuusha(toBe);
    if (asIs) {
      let update = false;
      /* tslint:disable:triple-equals */
      if (asIs.KolKyuushaCode == null && toBe.KolKyuushaCode != null) {
        asIs.KolKyuushaCode = toBe.KolKyuushaCode;
        update = true;
      }
      if (asIs.JrdbKyuushaCode == null && toBe.JrdbKyuushaCode != null) {
        asIs.JrdbKyuushaCode = toBe.JrdbKyuushaCode;
        update = true;
      }
      if (asIs.KyuushaMei == null && toBe.KyuushaMei != null) {
        asIs.KyuushaMei = toBe.KyuushaMei;
        update = true;
      }
      if (asIs.TanshukuKyuushaMei == null && toBe.KyuushaMei != null) {
        asIs.TanshukuKyuushaMei = toBe.TanshukuKyuushaMei;
        update = true;
      }
      if (asIs.Furigana == null && toBe.Furigana != null) {
        asIs.Furigana == toBe.Furigana;
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
      if (asIs.ShozokuBasho == null && toBe.ShozokuBasho != null) {
        asIs.ShozokuBasho = toBe.ShozokuBasho;
        update = true;
      }
      if (asIs.RitsuHokuNanBetsu == null && toBe.RitsuHokuNanBetsu != null) {
        asIs.RitsuHokuNanBetsu = toBe.RitsuHokuNanBetsu;
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
        toBe = await this.getKyuusha(toBe);
      }
    }
    return toBe;
  }

}