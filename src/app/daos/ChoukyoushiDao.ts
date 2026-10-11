import { Inject, Injectable } from "@nestjs/common";
import { EntityManager, Repository } from "typeorm";
import { Choukyoushi } from "../entities/Choukyoushi";
import { ChoukyoushiMei } from "../entities/ChoukyoushiMei";
import { Jinmei, JinmeiKubun } from "../entities/Jinmei";
import { OrmManager, OrmRepository } from "../OrmManager";
import { Tool } from "../reader/Tool";
import { JinmeiDao, jinmeiMatchingKey } from "./JinmeiDao";

@Injectable()
export class ChoukyoushiDao {
  @OrmManager()
  protected entityManager: EntityManager;

  @OrmRepository(Choukyoushi)
  private choukyoushiRepository: Repository<Choukyoushi>;

  @OrmRepository(ChoukyoushiMei)
  private choukyoushiMeiRepository: Repository<ChoukyoushiMei>;

  @Inject()
  private jinmeiDao: JinmeiDao;

  @Inject()
  private tool: Tool;

  private static readonly codeKeys = [
    "KolKyuushaCode",
    "JrdbChoukyoushiCode",
    "JvDataChoukyoushiCode",
  ] as const;

  /** 同じ種類のコードを両方持っていて、値が違うなら別人 */
  private conflicts(a: Choukyoushi, b: Choukyoushi) {
    return ChoukyoushiDao.codeKeys.some((k) => a[k] != null && b[k] != null && a[k] !== b[k]);
  }

  /** 名前(姓名か略称)が一致する調教師のうち、別人でないもの */
  private async findByMeishou(toBe: Choukyoushi, meishou: string) {
    const candidates = await this.choukyoushiRepository
      .createQueryBuilder("c")
      .innerJoin(ChoukyoushiMei, "cm", "cm.ChoukyoushiId = c.Id")
      .innerJoin(Jinmei, "j", "j.Id = cm.JinmeiId")
      .where("j.MatchingKey = :key", { key: jinmeiMatchingKey(meishou) })
      .getMany();
    return candidates.filter(
      (c) =>
        !this.conflicts(c, toBe) &&
        (!toBe.Seinengappi || !c.Seinengappi || toBe.Seinengappi === c.Seinengappi),
    );
  }

  /**
   * 既存の調教師を探します。コード(KOL・JRDB・JRA-VAN)のどれかが一致すればその調教師、
   * なければ姓名(と生年月日)が一致する調教師、姓名がなければ略称が一致する調教師が 1 人だけのときその調教師です。
   */
  protected async getChoukyoushi(choukyoushi: Choukyoushi, seimei?: string, tanshuku?: string) {
    for (const key of ChoukyoushiDao.codeKeys) {
      if (choukyoushi[key]) {
        const found = await this.choukyoushiRepository.findOneBy({ [key]: choukyoushi[key] });
        if (found) {
          return found;
        }
      }
    }
    if (seimei) {
      const candidates = await this.findByMeishou(choukyoushi, seimei);
      if (candidates.length === 1 || (candidates.length > 1 && choukyoushi.Seinengappi)) {
        return candidates[0];
      }
    } else if (tanshuku) {
      const candidates = await this.findByMeishou(choukyoushi, tanshuku);
      if (candidates.length === 1) {
        return candidates[0];
      }
    }
    return null;
  }

  public async saveChoukyoushi(
    toBe: Choukyoushi,
    seimei?: string,
    tanshuku?: string,
    furigana?: string,
  ) {
    const asIs = await this.getChoukyoushi(toBe, seimei, tanshuku);
    const newCode =
      !!asIs && ChoukyoushiDao.codeKeys.some((k) => toBe[k] != null && asIs[k] == null);
    if (!asIs || newCode || (seimei && tanshuku && furigana)) {
      toBe = await this.tool.saveOrUpdate(Choukyoushi, asIs, toBe);
    } else {
      return asIs;
    }
    if (seimei) {
      await this.saveChoukyoushiMei(toBe, JinmeiKubun.Seimei, seimei);
    }
    if (tanshuku) {
      await this.saveChoukyoushiMei(toBe, JinmeiKubun.Tanshuku, tanshuku);
      if (3 < tanshuku.length) {
        tanshuku = tanshuku.substring(0, 3);
        await this.saveChoukyoushiMei(toBe, JinmeiKubun.Tanshuku, tanshuku);
      }
    }
    if (furigana) {
      await this.saveChoukyoushiMei(toBe, JinmeiKubun.Furigana, furigana);
    }
    return toBe;
  }

  protected async saveChoukyoushiMei(
    choukyoushi: Choukyoushi,
    kubun: JinmeiKubun,
    meishou: string,
  ) {
    const jinmei = await this.jinmeiDao.save(meishou);
    let choukyoushiMei = await this.choukyoushiMeiRepository.findOneBy({
      ChoukyoushiId: choukyoushi.Id,
      JinmeiId: jinmei.Id,
      Kubun: kubun,
    });
    if (!choukyoushiMei) {
      choukyoushiMei = new ChoukyoushiMei();
      choukyoushiMei.ChoukyoushiId = choukyoushi.Id;
      choukyoushiMei.JinmeiId = jinmei.Id;
      choukyoushiMei.Kubun = kubun;
      await this.choukyoushiMeiRepository.save(choukyoushiMei);
    }
  }
}
