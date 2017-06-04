import { Logger } from "log4js";
import { Service } from "typedi";
import { RaceKeika } from "../entities/RaceKeika";
import { Shussouba } from "../entities/Shussouba";
import { ShussoubaKeika } from "../entities/ShussoubaKeika";
import { getLogger } from "../LogUtil";

@Service()
export class KeikaTool {

  private logger: Logger;

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

  protected buildShussoubaKeika(raceKeika: RaceKeika, shussoubaKeika: ShussoubaKeika, umabanStr: string) {
    const umaban = parseInt(umabanStr);
    const shussouba = new Shussouba();
    shussouba.Id = raceKeika.Race.Id * 100 + umaban;
    shussoubaKeika.Id = raceKeika.Id * 100 + umaban;
    shussoubaKeika.RaceKeika = raceKeika;
    shussoubaKeika.Shussouba = shussouba;
    return shussoubaKeika;
  }

  public parseRaceKeika(raceKeika: RaceKeika) {
    const shussoubaKeikaList: ShussoubaKeika[] = [];
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
          shussoubaKeikaList.push(this.buildShussoubaKeika(raceKeika, shussoubaKeika, umaban));
          shussoubaKeika = this.createShussoubaKeika(shussoubaKeika);
        }
        continue;
      } else { // 数字でない場合
        if (0 < umaban.length) {
          shussoubaKeikaList.push(this.buildShussoubaKeika(raceKeika, shussoubaKeika, umaban));
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
    return shussoubaKeikaList;
  }

}