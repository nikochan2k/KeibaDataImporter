import * as log4js from "log4js";

export const LOG_LEVEL = log4js.levels.DEBUG;

export const logging = {
  logFailedQueryError: true,
  logOnlyFailedQueries: false,
  logQueries: false,
  logSchemaCreation: false
};