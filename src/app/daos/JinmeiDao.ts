import { toMatchingKey } from "itaiji-normalize";
import { Service } from "typedi";
import { Repository } from "typeorm";
import { Jinmei, JinmeiKubun } from "../entities/Jinmei";
import { OrmRepository } from "../OrmManager";

/** 空白(半角・全角)をすべて除く */
export function stripJinmei(meishou: string) {
  return meishou.replace(/[\s\u3000]+/g, "");
}

/**
 * 人名の突き合わせ用のキー。NFKC で半角カナや全角英数を揃え、異体字(髙→高、﨑→崎、嶋→島 など)を
 * IPA の MJ 縮退マップで代表の字にする。表示用の名前は変えず、このキーで探す。
 */
export function jinmeiMatchingKey(meishou: string) {
  return toMatchingKey(stripJinmei(meishou)).key;
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
    meishou = stripJinmei(meishou);
    let jinmei = await this.repository.findOneBy({ Meishou: meishou });
    if (!jinmei) {
      jinmei = new Jinmei();
      jinmei.Kubun = kubun;
      jinmei.Meishou = meishou;
      jinmei.MatchingKey = jinmeiMatchingKey(meishou);
      jinmei = await this.repository.save(jinmei);
    }
    return jinmei;
  }
}
