import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./AppModule";
import { dataSource } from "./DataSource";
import { getLogger } from "./LogUtil";
import { Traversal } from "./Traversal";

const logger = getLogger("main");

let dirName = "";
if (3 <= process.argv.length) {
  dirName = process.argv[2];
}

dataSource
  .initialize()
  .then(async (con) => {
    await con.synchronize(false);
    const app = await NestFactory.createApplicationContext(AppModule, { logger: false });
    try {
      await app.get(Traversal).traverse(dirName);
    } finally {
      await app.close();
    }
    await con.destroy();
  })
  .catch((reason) => {
    logger.fatal(reason);
  });
