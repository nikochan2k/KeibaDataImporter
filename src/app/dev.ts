import index from "../../web/index.html";
import { closeDb, openDb } from "./db/db";
import { createApp } from "./http/app";
import { getLogger, silenceLoggers } from "./LogUtil";

const logger = getLogger("dev");

const port = Number(process.env.PORT) || 3000;
const apiPort = port + 1;

/**
 * 開発用サーバー。画面は Bun の HMR 付きで配信し、/api は別ポートの API サーバーへ流す。
 * 画面だけが HMR の対象で、API 側のコードを変えたときは再起動が要る。
 */
async function main() {
  silenceLoggers();
  openDb();

  // 取り込みの API はローカル限定なので、127.0.0.1 だけで待ち受ける
  const api = createApp().listen({ hostname: "127.0.0.1", port: apiPort });
  const web = Bun.serve({
    hostname: "127.0.0.1",
    port,
    development: true,
    routes: {
      "/api/*": (request) => {
        const url = new URL(request.url);
        return fetch(
          new Request(`http://127.0.0.1:${apiPort}${url.pathname}${url.search}`, request),
        );
      },
      "/*": index,
    },
  });
  logger.info(`http://127.0.0.1:${port} で待ち受けています (HMR 有効)`);

  const shutdown = async () => {
    await web.stop();
    await api.stop();
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
