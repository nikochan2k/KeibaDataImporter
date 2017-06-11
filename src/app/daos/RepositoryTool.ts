import { Service } from "typedi";

export enum ActionForDB {
  None,
  Insert,
  Update
}

@Service()
export class DaoTool {

  public changeAsIs(asIs: any, toBe: any, keysForInsert: string[]) {
    const asIsKeys = Object.keys(asIs);
    const toBeKeys = Object.keys(toBe);
    const keys = asIsKeys.concat(toBeKeys.filter(function (item) {
      return asIsKeys.indexOf(item) < 0;
    }));
    let result = ActionForDB.None;
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      if (key === "Id") {
        continue;
      }
      const asIsValue = asIs[key];
      const toBeValue = toBe[key];
      if (asIsValue !== toBeValue) {
        if (0 <= keysForInsert.indexOf(key)) {
          asIs[key] = toBeValue;
          result = ActionForDB.Insert;
        } else {
          /* tslint:disable:triple-equals */
          if (toBeValue != null) {
            asIs[key] = toBeValue;
          }
          /* tslint:enable:triple-equals */
          result = ActionForDB.Update;
        }
      }
    }
    return result;
  }

}