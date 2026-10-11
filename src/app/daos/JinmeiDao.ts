import { toMatchingKey } from "itaiji-normalize";
import { findOneBy, save } from "../db/helpers";
import { Jinmei } from "../entities/Jinmei";

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

export class JinmeiDao {
  public findOne(id: number) {
    /* tslint:disable:triple-equals */
    if (id == null) {
      return null;
    }
    /* tslint:enable:triple-equals */
    return findOneBy(Jinmei, { Id: id });
  }

  /** 突き合わせ用のキーが同じ名前があればそれを、なければ新しく作って返します。 */
  public async save(meishou: string) {
    meishou = stripJinmei(meishou);
    const matchingKey = jinmeiMatchingKey(meishou);
    let jinmei = await findOneBy(Jinmei, { MatchingKey: matchingKey });
    if (!jinmei) {
      jinmei = {} as Jinmei;
      jinmei.Meishou = meishou;
      jinmei.MatchingKey = matchingKey;
      jinmei = await save(Jinmei, jinmei);
    }
    return jinmei;
  }
}

export const jinmeiDao = new JinmeiDao();
