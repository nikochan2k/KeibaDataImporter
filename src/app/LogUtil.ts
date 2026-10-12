import {
  configureSync,
  getConsoleSink,
  getLogger as getLogTapeLogger,
  type Logger,
  type LogRecord,
} from "@logtape/logtape";

export type { Logger, LogRecord };

let quiet = false;
/** 黙らせたあとに作ったロガーのカテゴリ。起動時に作ったロガーは含まれず、コンソールに出し続ける */
const silenced = new Set<string>();

const consoleSink = getConsoleSink();

function configureWith(sink: (record: LogRecord) => void) {
  configureSync({
    reset: true,
    sinks: { main: sink },
    loggers: [
      { category: [], sinks: ["main"], lowestLevel: "debug" },
      { category: ["logtape", "meta"], sinks: [], lowestLevel: "warning" },
    ],
  });
}

function configureConsole() {
  configureWith((record) => {
    if (!silenced.has(record.category[0])) {
      consoleSink(record);
    }
  });
}

configureConsole();

/**
 * これ以降に作るロガーを黙らせる。サーバーは取り込みの経過を画面に出すので、コンソールには出さない。
 * 起動時に出すロガーはモジュール読み込み時に作っておくので、影響を受けない。
 */
export function silenceLoggers() {
  quiet = true;
}

/** silenceLoggers を呼んだかどうか。ワーカーにも同じ設定を引き継ぐために使う */
export function loggersSilenced() {
  return quiet;
}

/** ログをコンソールではなくメモリに溜める (テスト用)。返した配列に溜まるので、length = 0 で空にできる */
export function recordLogs(): LogRecord[] {
  const records: LogRecord[] = [];
  configureWith((record) => {
    records.push(record);
  });
  return records;
}

/** recordLogs の前の、コンソールに出す設定に戻す */
export function restoreConsoleLogs() {
  configureConsole();
}

export function getLogger(obj: object | string): Logger {
  let categoryName: string;
  if (typeof obj === "string") {
    categoryName = obj;
  } else if (obj.constructor.name) {
    categoryName = obj.constructor.name;
  } else {
    categoryName = Object.prototype.toString.call(obj).replace(/\[object\s+|\]/g, "");
  }
  if (quiet) {
    silenced.add(categoryName);
  }
  return getLogTapeLogger([categoryName]);
}
