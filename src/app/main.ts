import "reflect-metadata";
import { createConnection, useContainer } from "typeorm";
import { Container } from "typedi";
import { Traversal } from "./Traversal";
import { logging } from "./LogUtil";

let dirName = "";
if (3 <= process.argv.length) {
  dirName = process.argv[2];
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
  logging: logging
}).then(async (con) => {
  await con.syncSchema(false);
  const traversal = Container.get(Traversal);
  await traversal.traverse(dirName);
});
