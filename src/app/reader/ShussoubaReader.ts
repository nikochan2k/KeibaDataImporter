import { EntityManager } from "typeorm";
import { DataReader } from "./DataReader";
import { readInt } from "./ReadTool";
import { Race } from "../entities/Race";
import { RaceKeika } from "../entities/RaceKeika";
import { Shussouba } from "../entities/Shussouba";
import { ShussoubaKeika } from "../entities/ShussoubaKeika";
import { Kishu } from "../entities/Kishu";
import { Kyuusha } from "../entities/Kyuusha";
import { Uma } from "../entities/Uma";
import { Banushi } from "../entities/Banushi";

interface RaceMap {
  [raceId: number]: Race;
}

export abstract class ShussoubaReader extends DataReader {

  constructor(entityManager: EntityManager, fd: number) {
    super(entityManager, fd);
  }

  protected raceMap: RaceMap = {};

  protected async getRace(raceId: number) {
    let race = this.raceMap[raceId];
    if (!race) {
      race = await this.entityManager.findOneById(Race, raceId);
      if (!race) {
        this.logger.warn("レースがありません: " + raceId);
        return null;
      }
      race.ShussoubaList = [];
      this.raceMap[raceId] = race;
    }
    return race;
  }

  protected async getKyuusha(kyuushaMei: string) {
    let kyuusha = await this.entityManager
      .getRepository(Kyuusha)
      .createQueryBuilder("k")
      .where("k.KyuushaMei = :kyuushaMei")
      .setParameter("kyuushaMei", kyuushaMei)
      .getOne();
    if (!kyuusha) {
      kyuusha = new Kyuusha();
      kyuusha.KyuushaMei = kyuushaMei;
    }
    return kyuusha;
  }

  protected async getKishu(kishuMei: string) {
    let kishu = await this.entityManager
      .getRepository(Kishu)
      .createQueryBuilder("k")
      .where("k.KishuMei = :kishuMei")
      .setParameter("kishuMei", kishuMei)
      .getOne();
    if (!kishu) {
      kishu = new Kishu();
      kishu.KishuMei = kishuMei;
    }
    return kishu;
  }

  protected async getBanushi(banushiMei: string) {
    let banushi = await this.entityManager
      .getRepository(Banushi)
      .createQueryBuilder("b")
      .where("b.BanushiMei = :banushiMei")
      .setParameter("banushiMei", banushiMei)
      .getOne();
    if (!banushi) {
      banushi = new Banushi();
      banushi.BanushiMei = banushiMei;
    }
    return banushi;
  }

  protected async getUma(bamei: string) {
    let uma = await this.entityManager
      .getRepository(Uma)
      .createQueryBuilder("u")
      .where("u.KanaBamei = :bamei")
      .orWhere("u.KyuuBamei = :bamei")
      .setParameter("bamei", bamei)
      .getOne();
    if (!uma) {
      uma = new Uma();
      uma.KanaBamei = bamei;
    }
    return uma;
  }

  protected async normalizeNenrei(shussouba: Shussouba) {
    if (shussouba.Race.KaisaiNen <= 2000) {
      shussouba.Nenrei--;
    }
  }

  protected getChakujun(buffer, offset, length) {
    const chakujun = readInt(buffer, offset, length);
    if (1 <= chakujun && chakujun <= 28) {
      return chakujun;
    }
    return null;
  }

  protected async finishUp() {
    for (const raceId in this.raceMap) {
      const race = this.raceMap[raceId];
      const raceKeikaList = await this.getRaceKeika(race.Id);
      raceKeikaList.forEach(async (raceKeika) => {
        await this.parseRaceKeika(race, raceKeika);
      });
    }
  }

  protected async getRaceKeika(raceId: number) {
    return await this.entityManager
      .getRepository(RaceKeika)
      .createQueryBuilder("rk")
      .where("rk.RaceId = :raceId")
      .setParameter("raceId", raceId)
      .getMany();
  }

  protected createShussoubaKeika(old?: ShussoubaKeika) {
    const shussoubaKeika = new ShussoubaKeika();
    if (old) {
      shussoubaKeika.TateCount = old.TateCount;
      shussoubaKeika.TateHanareteCount = old.TateHanareteCount;
      shussoubaKeika.TateOokikuHanareteCount = old.TateOokikuHanareteCount;
      shussoubaKeika.YokoCount = old.YokoCount;
    } else {
      shussoubaKeika.TateCount = 0;
      shussoubaKeika.TateHanareteCount = 0;
      shussoubaKeika.TateOokikuHanareteCount = 0;
      shussoubaKeika.YokoCount = 0;
    }
    return shussoubaKeika;
  }

  protected findShussouba(race: Race, umaban: number) {
    for (let i = 0; i < race.ShussoubaList.length; i++) {
      const shussouba = race.ShussoubaList[i];
      if (shussouba.Umaban === umaban) {
        return shussouba;
      }
    }
    return null;
  }

  protected async saveShussoubaKeika(race: Race, raceKeika: RaceKeika, shussoubaKeika: ShussoubaKeika, umabanStr: string) {
    const umaban = parseInt(umabanStr);
    const shussouba = await this.findShussouba(race, umaban);
    if (!shussouba) {
      return;
    }
    shussoubaKeika.Id = raceKeika.Id * 100 + umaban;
    shussoubaKeika.RaceKeika = raceKeika;
    shussoubaKeika.Shussouba = shussouba;
    await this.entityManager.persist(shussoubaKeika);
  }

  protected async parseRaceKeika(race: Race, raceKeika: RaceKeika) {
    const keika = raceKeika.Keika;
    let shussoubaKeika = this.createShussoubaKeika();
    let umaban = "";
    let bracket = false;
    for (let i = 0; i < keika.length; i++) {
      const ch = keika[i];
      if (/[0-9]/.test(ch)) { // 数字の場合
        if (0 < i && keika[i - 1] === ")") {
          shussoubaKeika.TateCount++;
        }
        umaban = umaban + ch; // 数字を連結
        // 最後の文字が数字の場合
        if (i === keika.length - 1) {
          await this.saveShussoubaKeika(race, raceKeika, shussoubaKeika, umaban);
          shussoubaKeika = this.createShussoubaKeika(shussoubaKeika);
        }
        continue;
      } else { // 数字でない場合
        if (0 < umaban.length) {
          await this.saveShussoubaKeika(race, raceKeika, shussoubaKeika, umaban);
          shussoubaKeika = this.createShussoubaKeika(shussoubaKeika);
          umaban = "";
        }
        // "("の後の場合
        if (bracket) {
          switch (ch) {
            case ".":
              shussoubaKeika.YokoCount++;
              break;
            case ")":
              shussoubaKeika.YokoCount = 0;
              bracket = false;
              break;
            case "*":
            case "止":
            case "落":
              break;
            default:
              this.logger.warn('不正な経過"' + ch + '": ' + raceKeika.Id);
              break;
          }
        } else {
          switch (ch) {
            case ".":
              shussoubaKeika.TateCount++;
              break;
            case "-":
              shussoubaKeika.TateHanareteCount++;
              break;
            case "=":
              shussoubaKeika.TateOokikuHanareteCount++;
              break;
            case "(":
              shussoubaKeika.TateCount++;
              bracket = true;
              break;
            default:
              this.logger.warn('不正な経過"' + ch + '": ' + raceKeika.Id);
              break;
          }
        }
      }
    }
  }

}
