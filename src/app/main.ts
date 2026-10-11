import { closeDb, openDb } from "./db/db";
import { getLogger } from "./LogUtil";
import { traversal } from "./Traversal";

const logger = getLogger("main");

let dirName = "";
if (3 <= process.argv.length) {
  dirName = process.argv[2];
}

try {
  openDb();
  await traversal.traverse(dirName);
  closeDb();
} catch (reason) {
  logger.fatal(reason);
}
