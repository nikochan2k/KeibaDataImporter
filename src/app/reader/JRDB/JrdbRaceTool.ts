import { Inject, Service } from "typedi";
import { JrdbKaisaiTool } from "./JrdbKaisaiTool";
import { RaceTool } from "../RaceTool";
import { readPositiveInt } from "../Reader";

@Service()
export class JrdbRaceTool extends RaceTool {

  @Inject()
  private jrdbKaisaiTool: JrdbKaisaiTool;

  protected getKaisaiTool() {
    return this.jrdbKaisaiTool;
  }

  public getRace(buffer: Buffer, kaisaiId?: number) {
    if (!kaisaiId) {
      kaisaiId = this.getKaisaiTool().getKaisaiId(buffer);
    }
    return super.getRace(buffer, kaisaiId);
  }

  public getRaceId(buffer: Buffer) {
    const kaisaiId = this.getKaisaiTool().getKaisaiId(buffer);
    return super.getRaceId(buffer, kaisaiId);
  }

  protected getRaceBangou(buffer: Buffer) {
    const raceBangou = readPositiveInt(buffer, 6, 2);
    return raceBangou;
  }

}