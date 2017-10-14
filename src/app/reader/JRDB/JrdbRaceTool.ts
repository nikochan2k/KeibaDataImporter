import { Inject, Service } from "typedi";
import { JrdbKaisaiTool } from "./JrdbKaisaiTool";
import { RaceTool } from "../RaceTool";
import { readPositiveInt } from "../Reader";

@Service()
export class JrdbRaceTool extends RaceTool {

  @Inject()
  private jrdbKaisaiTool: JrdbKaisaiTool;

  public getRace(buffer: Buffer, kaisaiId?: number) {
    if (!kaisaiId) {
      kaisaiId = this.jrdbKaisaiTool.getKaisaiId(buffer);
    }
    return super.getRace(buffer, kaisaiId);
  }

  public getRaceId(buffer: Buffer) {
    const kaisaiId = this.jrdbKaisaiTool.getKaisaiId(buffer);
    return super.getRaceId(buffer, kaisaiId);
  }

  protected getRaceBangou(buffer: Buffer) {
    const raceBangou = readPositiveInt(buffer, 8, 2);
    return raceBangou;
  }

}