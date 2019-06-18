import { Inject, Service } from "typedi";
import { JrdbRaceTool } from "./JrdbRaceTool";
import * as $SJ from "../../converters/ShussoubaJoutai";
import { Kubun } from "../../entities/ShussoubaJoutai";
import { Kishu } from "../../entities/Kishu";
import { KishuDao } from "../../daos/KishuDao";
import { ShussoubaTool } from "../ShussoubaTool";
import { readStrWithNoSpace, readInt } from "../../reader/Reader";

@Service()
export class JrdbShussoubaTool extends ShussoubaTool {

  @Inject()
  private jrdbRaceTool: JrdbRaceTool;

  @Inject()
  private kishuDao: KishuDao;

  protected getRaceId(buffer: Buffer) {
    return this.jrdbRaceTool.getRaceId(buffer);
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

  public async saveKishu(buffer: Buffer, kishuCodeOffset: number, kishuMeiOffset: number) {
    const kishu = new Kishu();
    const kishuMei = readStrWithNoSpace(buffer, kishuMeiOffset, 12);
    kishu.JrdbKishuCode = readInt(buffer, kishuCodeOffset, 5);
    return this.kishuDao.saveKishu(kishu, kishuMei);
  }
}