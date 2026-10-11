import "reflect-metadata";
import { dataSource } from "./DataSource";
import { getLogger } from "./LogUtil";
import { traversal } from "./Traversal";

const logger = getLogger("main");

let dirName = "";
if (3 <= process.argv.length) {
  dirName = process.argv[2];
}

dataSource
  .initialize()
  .then(async (con) => {
    await con.synchronize(false);
    await traversal.traverse(dirName);
    await con.destroy();
  })
  .catch((reason) => {
    logger.fatal(reason);
  });
