import * as log4js from "log4js";

export function getLogger(obj: any) {
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
  logger.level = "debug";
  return logger;
}