import * as $U from "../../converters/Uma";
import { umaDao } from "../../daos/UmaDao";
import { Uma } from "../../entities/Uma";
import { readInt, readStr } from "../Reader";
import { tool } from "../Tool";

export class KolUmaTool {
  public async saveOyaUma(
    buffer: Buffer,
    offset: number,
    seibetsu: $U.Seibetsu,
    chichiOffset?: number,
    hahaOffset?: number,
  ) {
    const bamei = readStr(buffer, offset + 7, 34);
    if (!bamei) {
      return null;
    }
    const uma = {} as Uma;
    uma.KolUmaCode = readInt(buffer, offset, 7);
    if (tool.isEnglish(bamei)) {
      uma.EigoBamei = bamei;
    } else {
      uma.KanaBamei = bamei;
    }
    if (chichiOffset && !uma.ChichiUmaId) {
      const chichiUma = await this.saveOyaUma(buffer, chichiOffset, $U.Seibetsu.Boba);
      uma.ChichiUmaId = chichiUma?.Id;
    }
    if (hahaOffset && !uma.HahaUmaId) {
      const hahaUma = await this.saveOyaUma(buffer, hahaOffset, $U.Seibetsu.Hinba);
      uma.HahaUmaId = hahaUma?.Id;
    }
    uma.Seibetsu = seibetsu;

    return umaDao.saveUma(uma);
  }
}

export const kolUmaTool = new KolUmaTool();
