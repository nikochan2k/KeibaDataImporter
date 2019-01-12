import { LhaReader } from "../app/util/LHA";
import * as ioutil from "../app/util/IOUtil";
import * as fs from "fs";

if (process.argv.length < 3) {
  console.log("No file");
  process.exit(1);
}

const path = process.argv[2];
const buf = fs.readFileSync(path);
const view = ioutil.toUint8Array(buf);

const lhaReader = new LhaReader(view);
for (const key in lhaReader.entries) {
  const bytes = lhaReader.extractSync(key);
  const buffer = ioutil.toBuffer(bytes);
  fs.writeFileSync(key, buffer);
}
