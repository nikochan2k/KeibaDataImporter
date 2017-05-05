import "reflect-metadata";
import { createConnection, Connection } from "typeorm";
import * as path from "path";
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
        storage: "test.sqlite"
      },
      entities: [
        __dirname + "/entities/*.js"
      ],
      autoSchemaSync: true
    }).then(con => {
      this.con = con;
    }).catch(error => {
      throw error;
    });
  }

  public importDataFile(dataFile: string) {
    const basename = path.basename(dataFile);
    console.log(basename);
  }
}
