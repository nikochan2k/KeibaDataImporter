import { Inject, Service } from "typedi";
import { JrdbRaceTool } from "./JrdbRaceTool";
import * as $SJ from "../../converters/ShussoubaJoutai";
import { Kubun } from "../../entities/ShussoubaJoutai";
import { ShussoubaInfo, ShussoubaTool } from "../ShussoubaTool";

@Service()
export class JrdbShussoubaTool extends ShussoubaTool {

  @Inject()
  private jrdbRaceTool: JrdbRaceTool;

  public async getShussoubaInfo(buffer: Buffer, umabanOffset: number): Promise<ShussoubaInfo> {
    const race = await this.jrdbRaceTool.getRace(buffer);
    return super.getShussoubaInfo(buffer, umabanOffset, race);
  }

  public getShussoubaId(buffer: Buffer, umabanOffset: number) {
    const raceId = this.jrdbRaceTool.getRaceId(buffer);
    return super.getShussoubaId(buffer, umabanOffset, raceId);
  }

  public createShussouba(buffer: Buffer, umabanOffset: number) {
    const raceId = this.jrdbRaceTool.getRaceId(buffer);
    return super.createShussouba(buffer, umabanOffset, raceId);
  }

  public async saveShussoubaJoutaiWith(buffer: Buffer, offset: number, shussoubaId: number, kubun: Kubun) {
    let code: number;
    if (Kubun.TaikeiSougaou <= kubun && kubun <= Kubun.Tokki) {
      code = $SJ.tokki.toCodeFromJrdb(buffer, offset, 3);
    } else if (Kubun.Bagu <= kubun && kubun <= Kubun.BaguKotsuryuu) {
      code = $SJ.bagu.toCodeFromJrdb(buffer, offset, 3);
    } else if (Kubun.AshimotoSougou <= kubun && kubun <= Kubun.AshimotoMigiUshiro) {
      code = $SJ.ashimoto.toCodeFromJrdb(buffer, offset, 3);
    } else {
      // TODO ログ
      return;
    }
    await this.saveShussoubaJoutai(shussoubaId, kubun, code);
  }

}