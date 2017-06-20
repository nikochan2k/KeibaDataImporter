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

  protected getKishu(kishu: Kishu) {
    return this.kishuRepository.findOne({ KishuMei: kishu.KishuMei });
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

  protected async saveKishu(toBe: Kishu) {
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
    toBe.Kishu = await this.saveKishu(kishu);
    toBe.KishuShozoku = await this.saveKishuShozoku(kishuShozoku);
    toBe.MinaraiKubun = minaraiKubun;
    const asIs = await this.getKijouKishu(toBe);
    if (asIs) {
      toBe = asIs;
    } else {
      toBe = await this.kijouKishuRepository.save(toBe);
    }
    return toBe;
  }

}