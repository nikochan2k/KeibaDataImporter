import { Service } from "typedi";
import { JrdbKaisaiTool } from "./JrdbKaisaiTool";
import { KaisaiInfo } from "../KaisaiTool";
import {
  readHex,
  readInt,
  readPositiveInt,
} from "../Reader";

@Service()
export class JrdbKaisaiRaceTool extends JrdbKaisaiTool {

  protected getKaisaiInfo(buffer: Buffer): KaisaiInfo {
    return {
      basho: this.getBasho(buffer),
      nen: readInt(buffer, 8, 4),
      gatsu: readInt(buffer, 12, 2),
      nichi: readInt(buffer, 14, 2),
      kaiji: readPositiveInt(buffer, 4, 1),
      nichiji: readHex(buffer, 5, 1),
    };
  }

}