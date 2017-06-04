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
        asIs[key] = toBeValue;
        if (0 <= keysForInsert.indexOf(key)) {
          result = ActionForDB.Insert;
        } else {
          result = ActionForDB.Update;
        }
      }
    }
    return result;
  }

}