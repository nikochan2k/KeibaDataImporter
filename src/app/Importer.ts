import "reflect-metadata";
import { createConnection, Connection } from "typeorm";
import * as path from "path";
import * as $E from './entities'
import * as log4js from "log4js";
import { Constant } from "./Constant";

export class Importer {

  private logger: log4js.Logger;
  private con: Connection;

  constructor() {
    this.constructLogger();
    this.constructConection();
  }

  protected constructLogger() {
    this.logger = log4js.getLogger("import");
    this.logger.setLevel(Constant.LOG_LEVEL);
  }

  protected constructConection() {
    createConnection({
      driver: {
        type: "sqlite",
        storage: "keiba.sqlite"
      },
      entities: [
        $E.Race, $E.RaceYosou, $E.RaceYosouTenkai, $E.RaceRecord, $E.RaceLapTime,
        $E.RaceHaitou, $E.OddsKubun, $E.Odds, $E.Shussouba, $E.Kishu, $E.Kyuusha,
        $E.Choukyou, $E.ChoukyouRireki, $E.ChoukyouTime, $E.ShussoubaTsuukaJuni,
        $E.RaceHassouJoukyou, $E.RaceKeika, $E.ShussoubaKeika, $E.Kyousouba, $E.Code
      ],
      autoSchemaSync: true
    }).then(con => {
      this.con = con;
    }).catch(error => {
      throw error;
    });
  }

  public importDataFile(dataFile: string){
    const basename = path.basename(dataFile);
    console.log(basename);
  }
}
