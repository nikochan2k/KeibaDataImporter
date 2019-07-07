import "reflect-metadata";
import { Container } from "typedi";
import { createConnection, useContainer } from "typeorm";
import { getLogger } from "./LogUtil";
import { Traversal } from "./Traversal";

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
  await con.synchronize(false);
  const traversal = Container.get(Traversal);
  await traversal.traverse(dirName);
  await con.close();
}).catch((reason) => {
  logger.fatal(reason);
});
