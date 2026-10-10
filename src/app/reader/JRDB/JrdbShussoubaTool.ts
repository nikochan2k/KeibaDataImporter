import { Inject, Service } from "typedi";
import * as $SJ from "../../converters/ShussoubaJoutai";
import { KishuDao } from "../../daos/KishuDao";
import { Kishu } from "../../entities/Kishu";
import { Kubun } from "../../entities/ShussoubaJoutai";
import { readPositiveInt, readStr, readStrWithNoSpace } from "../../reader/Reader";
import { ShussoubaTool } from "../ShussoubaTool";
import { JrdbRaceTool } from "./JrdbRaceTool";

@Service()
export class JrdbShussoubaTool extends ShussoubaTool {
  @Inject()
  private jrdbRaceTool: JrdbRaceTool;

  @Inject()
  private kishuDao: KishuDao;

  protected getRaceId(buffer: Buffer) {
    return this.jrdbRaceTool.getRaceId(buffer);
  }

  public async saveShussoubaJoutaiWith(
    buffer: Buffer,
    offset: number,
    shussoubaId: number,
    kubun: Kubun,
  ) {
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
    if (code === null || code === undefined) {
      // 空白の欄は保存しない(未定義のコードは警告のみ)
      if (readStr(buffer, offset, 3)) {
        this.logger.warn(`未定義の状態コード: kubun=${kubun}, code=${readStr(buffer, offset, 3)}`);
      }
      return;
    }
    await this.saveShussoubaJoutai(shussoubaId, kubun, code);
  }

  public async saveKishu(buffer: Buffer, kishuCodeOffset: number, kishuMeiOffset: number) {
    const kishu = new Kishu();
    const kishuMei = readStrWithNoSpace(buffer, kishuMeiOffset, 12);
    kishu.JrdbKishuCode = readPositiveInt(buffer, kishuCodeOffset, 5);
    if (!kishu.JrdbKishuCode) {
      // 地方・外国のレースなど、騎手が不明なとき。中身のない騎手を作らない
      return null;
    }
    return this.kishuDao.saveKishu(kishu, kishuMei);
  }
}
