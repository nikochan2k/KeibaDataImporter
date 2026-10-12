import * as $U from "../../../converters/Uma";
import { umaDao } from "../../../daos/UmaDao";
import { Uma } from "../../../entities/Uma";
import { readStr } from "../../Reader";
import { jraTool } from "../JraTool";

/** 3 代血統の並び (父・母・父父・父母・母父・母母・父父父・父父母・父母父・父母母・母父父・母父母・母母父・母母母) の親の位置 */
const parentsOf: { [index: number]: [number, number] } = {
  0: [2, 3],
  1: [4, 5],
  2: [6, 7],
  3: [8, 9],
  4: [10, 11],
  5: [12, 13],
};

/** 祖先 1 頭ぶん。繁殖登録番号か馬名のどちらかがあれば保存する */
export interface Sosen {
  bangou: string | null;
  bamei: string | null;
}

export class JvdataKettouTool {
  /** 繁殖登録番号 (10 桁)。初期値 (全部 0 か空白) のときは null */
  public readHanshokuBangou(buffer: Buffer, offset: number) {
    const str = readStr(buffer, offset, 10);
    return !str || /^0+$/.test(str) ? null : str;
  }

  /** 馬主コード (6 桁)。初期値 (全部 0 か空白) のときは null */
  public readBanushiCode(buffer: Buffer, offset: number) {
    const str = readStr(buffer, offset, 6);
    return !str || /^0+$/.test(str) ? null : str;
  }

  /** 生産者コード (8 桁)。初期値 (全部 0 か空白) のときは null */
  public readSeisanshaCode(buffer: Buffer, offset: number) {
    const str = readStr(buffer, offset, 8);
    return !str || /^0+$/.test(str) ? null : str;
  }

  /**
   * 祖先を、3 代血統の並び (父・母、続けて父父…) で保存し、同じ並びで返す。
   * 末端から保存して親をつなぐ。繁殖登録番号がなく馬名だけの祖先は、馬名で探す。
   * existing はいま取り込んでいる馬の既存の行で、その馬にすでにつないでいた祖先には、繁殖登録番号をそのまま付ける
   * (KOL・JRA-VAN などから馬名でつないだ祖先と、別の行にならないように)。
   */
  public async saveSosen(existing: Uma | null, sosen: Sosen[]) {
    const known = this.existingSosen(existing, sosen.length);
    const saved: (Uma | undefined)[] = [];
    for (let i = sosen.length - 1; 0 <= i; i--) {
      const { bangou, bamei } = sosen[i];
      if (!bangou && !bamei) {
        continue;
      }
      const oya = parentsOf[i];
      const uma = {} as Uma;
      jraTool.setBamei(uma, bamei);
      uma.Seibetsu = i % 2 === 0 ? $U.Seibetsu.Boba : $U.Seibetsu.Hinba;
      uma.ChichiUmaId = oya ? saved[oya[0]]?.Id : undefined;
      uma.HahaUmaId = oya ? saved[oya[1]]?.Id : undefined;
      saved[i] = bangou
        ? await umaDao.saveHanshokuba(bangou, uma, known[i])
        : await umaDao.saveUma(uma);
    }
    return saved;
  }

  /** 既存の行がすでにつないでいる祖先 (3 代血統の並び) */
  private existingSosen(existing: Uma | null, count: number) {
    const known: (Uma | null)[] = [];
    const child = (i: number) => (i < 2 ? existing : known[Math.floor(i / 2) - 1]);
    for (let i = 0; i < count; i++) {
      const id = i % 2 === 0 ? child(i)?.ChichiUmaId : child(i)?.HahaUmaId;
      known[i] = id ? umaDao.findUmaById(id) : null;
    }
    return known;
  }
}

export const jvdataKettouTool = new JvdataKettouTool();
