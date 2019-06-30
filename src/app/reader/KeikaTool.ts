import { Logger } from "log4js";
import { Service, Inject } from "typedi";
import { EntityManager } from "typeorm";
import { OrmManager } from "typeorm-typedi-extensions";
import { RaceKeika } from "../entities/RaceKeika";
import { ShussoubaKeika } from "../entities/ShussoubaKeika";
import { getLogger } from "../LogUtil";
import { Tool } from './Tool';

@Service()
export class KeikaTool {

  protected logger: Logger;

  @Inject()
  protected tool: Tool;

  @OrmManager()
  protected entityManager: EntityManager;

  constructor() {
    this.logger = getLogger(this);
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

  protected async saveShussoubaKeika(raceKeika: RaceKeika, toBe: ShussoubaKeika, umabanStr: string) {
    const umaban = parseInt(umabanStr);
    const shussoubaId = raceKeika.RaceId * (2 ** 6) + umaban;
    toBe.Id = raceKeika.Id * (2 ** 6) + umaban;
    toBe.RaceKeikaId = raceKeika.Id;
    toBe.ShussoubaId = shussoubaId;
    const asIs = await this.entityManager.findOne(ShussoubaKeika, toBe.Id);
    await this.tool.saveOrUpdate(ShussoubaKeika, asIs, toBe);
  }

  public async parseRaceKeika(raceKeika: RaceKeika) {
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
          await this.saveShussoubaKeika(raceKeika, shussoubaKeika, umaban);
          shussoubaKeika = this.createShussoubaKeika(shussoubaKeika);
        }
        continue;
      } else { // 数字でない場合
        if (0 < umaban.length) {
          await this.saveShussoubaKeika(raceKeika, shussoubaKeika, umaban);
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
            case "*":
            case "止":
            case "落":
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