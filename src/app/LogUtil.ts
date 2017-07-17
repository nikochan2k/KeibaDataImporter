import * as log4js from "log4js";

const LOG_LEVEL = log4js.levels.DEBUG;

export const logging = {
  logFailedQueryError: true,
  logOnlyFailedQueries: true,
  logQueries: false,
  logSchemaCreation: false
};

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
  logger.setLevel(LOG_LEVEL);
  return logger;
}