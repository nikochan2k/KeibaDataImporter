import { Inject, Service } from "typedi";
import { JrdbKaisaiTool } from "./JrdbKaisaiTool";
import { RaceTool } from "../RaceTool";
import { readPositiveInt, readRaw } from "../Reader";

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
    let raceBangou = readPositiveInt(buffer, 6, 2);
    if (raceBangou == null) {
      this.logger.debug("レース番号が不正です: " + readRaw(buffer, 6, 2));
      raceBangou = 0;
    }
    return raceBangou;
  }

}