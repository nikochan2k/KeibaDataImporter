import { Service } from "typedi";

@Service()
export class JrdbTool {

  public getDateFromFilename(basename: string) {
    const execed = /^[^0-9]+([0-9]{6})\.txt$/.exec(basename);
    if (!execed) {
      return null;
    }
    const yymmdd = parseInt(execed[1]);
    let yyyymmdd: number;
    if (700000 <= yymmdd) {
      yyyymmdd += 19000000;
    } else {
      yyyymmdd += 20000000;
    }
    return yyyymmdd;
  }

}