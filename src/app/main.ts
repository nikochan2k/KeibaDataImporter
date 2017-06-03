import "reflect-metadata";
import { createConnection, useContainer } from "typeorm";
import { Container } from "typedi";
import { App } from "./App";
import { logging } from "./LogUtil";

let arg = "";
if (3 <= process.argv.length) {
  arg = process.argv[2];
}

useContainer(Container);
createConnection({
  driver: {
    type: "sqlite",
    storage: "test.sqlite"
  },
  name: "default",
  entities: [
    __dirname + "/entities/*.js"
  ],
  logging: logging,
  autoSchemaSync: true
}).then(async () => {
  const app = new App(arg);
  await app.import();
});
