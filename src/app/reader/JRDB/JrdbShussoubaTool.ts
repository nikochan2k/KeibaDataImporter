import { Inject, Service } from "typedi";
import { JrdbRaceTool } from "./JrdbRaceTool";
import * as $SJ from "../../converters/ShussoubaJoutai";
import { Kubun } from "../../entities/ShussoubaJoutai";
import { ShussoubaTool } from "../ShussoubaTool";

@Service()
export class JrdbShussoubaTool extends ShussoubaTool {

  @Inject()
  private jrdbRaceTool: JrdbRaceTool;

  protected getRaceId(buffer: Buffer) {
    return this.jrdbRaceTool.getRace(buffer);
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