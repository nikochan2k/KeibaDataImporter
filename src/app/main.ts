import "reflect-metadata";
import { Container } from "typedi";
import { dataSource } from "./DataSource";
import { getLogger } from "./LogUtil";
import { Traversal } from "./Traversal";

const logger = getLogger("main");

let dirName = "";
if (3 <= process.argv.length) {
  dirName = process.argv[2];
}

dataSource.initialize().then(async (con) => {
  await con.synchronize(false);
  const traversal = Container.get(Traversal);
  await traversal.traverse(dirName);
  await con.destroy();
}).catch((reason) => {
  logger.fatal(reason);
});
