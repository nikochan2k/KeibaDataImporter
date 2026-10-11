/** 取り込みは、サーバーと同じマシンのブラウザ (localhost / 127.0.0.1) からだけ使わせる */
export const canImport = ["localhost", "127.0.0.1"].includes(location.hostname);
