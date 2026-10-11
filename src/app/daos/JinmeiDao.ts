import { Service } from "typedi";
import { Repository } from "typeorm";
import { Jinmei, JinmeiKubun } from "../entities/Jinmei";
import { OrmRepository } from "../OrmManager";

/** 異体字。同じ名前として扱うために、保存するときに代表の字にする */
const variants: { [variant: string]: string } = {
  髙: "高",
  﨑: "崎",
  𠮷: "吉",
  邉: "辺",
  邊: "辺",
  齋: "斎",
  齊: "斎",
  斉: "斎",
  德: "徳",
  澤: "沢",
  濱: "浜",
};

/**
 * 人名を、名寄せできる形にします。空白(半角・全角)をすべて除き、異体字を代表の字にします。
 * 保存するときも探すときも、この形で比べます。
 */
export function normalizeJinmei(meishou: string) {
  return Array.from(meishou.replace(/[\s\u3000]+/g, ""))
    .map((c) => variants[c] ?? c)
    .join("");
}

@Service()
export class JinmeiDao {
  @OrmRepository(Jinmei)
  private repository: Repository<Jinmei>;

  public findOne(id: number) {
    /* tslint:disable:triple-equals */
    if (id == null) {
      return null;
    }
    /* tslint:enable:triple-equals */
    return this.repository.findOneBy({ Id: id });
  }

  public async save(kubun: JinmeiKubun, meishou: string) {
    meishou = normalizeJinmei(meishou);
    let jinmei = await this.repository.findOneBy({ Meishou: meishou });
    if (!jinmei) {
      jinmei = new Jinmei();
      jinmei.Kubun = kubun;
      jinmei.Meishou = meishou;
      jinmei = await this.repository.save(jinmei);
    }
    return jinmei;
  }
}
