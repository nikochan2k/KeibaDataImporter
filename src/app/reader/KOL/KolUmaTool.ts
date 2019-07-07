import { Inject, Service } from "typedi";
import * as $U from "../../converters/Uma";
import { UmaDao } from "../../daos/UmaDao";
import { Uma } from "../../entities/Uma";
import { readInt, readStr } from "../Reader";
import { Tool } from "../Tool";

@Service()
export class KolUmaTool {

  @Inject()
  private tool: Tool;

  @Inject()
  private umaDao: UmaDao;


  public async saveOyaUma(buffer: Buffer, offset: number, seibetsu: $U.Seibetsu, chichiOffset?: number, hahaOffset?: number) {
    const bamei = readStr(buffer, offset + 7, 34);
    if (!bamei) {
      return null;
    }
    const uma = new Uma();
    uma.KolUmaCode = readInt(buffer, offset, 7);
    if (this.tool.isEnglish(bamei)) {
      uma.EigoBamei = bamei;
    } else {
      uma.KanaBamei = bamei;
    }
    if (chichiOffset && !uma.ChichiUmaId) {
      const chichiUma = await this.saveOyaUma(buffer, chichiOffset, $U.Seibetsu.Boba);
      uma.ChichiUmaId = chichiUma && chichiUma.Id;
    }
    if (hahaOffset && !uma.HahaUmaId) {
      const hahaUma = await this.saveOyaUma(buffer, hahaOffset, $U.Seibetsu.Hinba);
      uma.HahaUmaId = hahaUma && hahaUma.Id;
    }
    uma.Seibetsu = seibetsu;

    return this.umaDao.saveUma(uma);
  }

}