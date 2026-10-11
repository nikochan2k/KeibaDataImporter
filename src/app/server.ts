import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import type { NestExpressApplication } from "@nestjs/platform-express";
import { AppModule } from "./AppModule";
import { dataSource } from "./DataSource";
import { getLogger, silenceLoggers } from "./LogUtil";
import { serveWeb } from "./serveWeb";

const logger = getLogger("server");

const port = Number(process.env.PORT) || 3000;
// 取り込みはサーバー上のパスを読むので、既定ではこのマシンからしか受け付けない
const host = process.env.HOST || "127.0.0.1";

async function main() {
  silenceLoggers();
  await dataSource.initialize();
  // 取り込み(書き込み)中も閲覧(読み込み)が止まらないようにする
  await dataSource.query("PRAGMA journal_mode = WAL");
  await dataSource.synchronize(false);

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: ["error", "warn"],
  });
  serveWeb(app);
  app.enableShutdownHooks();
  await app.listen(port, host);
  logger.info(`http://${host}:${port} で待ち受けています`);

  const shutdown = async () => {
    await app.close();
    await dataSource.destroy();
    process.exit(0);
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

main().catch((reason) => {
  logger.fatal(reason);
  process.exit(1);
});
