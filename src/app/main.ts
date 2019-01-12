import "reflect-metadata";
import { createConnection, useContainer } from "typeorm";
import { Container } from "typedi";
import { Traversal } from "./Traversal";
import { getLogger } from "./LogUtil";

const logger = getLogger("main");

let dirName = "";
if (3 <= process.argv.length) {
  dirName = process.argv[2];
}

useContainer(Container);
createConnection({
  type: "sqlite",
  database: "keiba.sqlite",
  entities: [
    __dirname + "/entities/*.js"
  ],
  logging: ["error", "warn"]
}).then(async (con) => {
  await con.query("PRAGMA journal_mode = WAL");
  await con.synchronize(false);
  const traversal = Container.get(Traversal);
  await traversal.traverse(dirName);
}).catch((reason) => {
  logger.fatal(reason);
});
