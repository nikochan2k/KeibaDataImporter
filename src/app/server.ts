import { closeDb, openDb } from "./db/db";
import { createApp } from "./http/app";
import { getLogger, silenceLoggers } from "./LogUtil";

const logger = getLogger("server");

const port = Number(process.env.PORT) || 3000;
// 取り込みはサーバー上のパスを読むので、既定ではこのマシンからしか受け付けない
const host = process.env.HOST || "127.0.0.1";

async function main() {
  silenceLoggers();
  openDb();

  const app = createApp().listen({ hostname: host, port });
  logger.info(`http://${host}:${port} で待ち受けています`);

  const shutdown = async () => {
    await app.stop();
    closeDb();
    process.exit(0);
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

main().catch((reason) => {
  logger.fatal(reason);
  process.exit(1);
});
