import * as log4js from "log4js";

let quiet = false;

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

export function getLogger(obj: object | string) {
  let categoryName: string;
  if (typeof obj === "string") {
    categoryName = obj;
  } else if (obj.constructor.name) {
    categoryName = obj.constructor.name;
  } else {
    categoryName = Object.prototype.toString.call(obj);
    categoryName = categoryName.replace(/\\[object\\s+|\\]/g, "");
  }
  const logger = log4js.getLogger(categoryName);
  logger.level = quiet ? "off" : "debug";
  return logger;
}
