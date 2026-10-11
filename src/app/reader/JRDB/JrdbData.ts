import { Inject } from "@nestjs/common";
import { Bridge } from "../Bridge";
import { DataToImport } from "../DataToImport";
import { JrdbBridge } from "./JrdbBridge";

export abstract class JrdbData extends DataToImport {
  private static YYMMDD = /(\d{2})(\d{2})(\d{2})/;

  @Inject()
  protected bridge: Bridge;

  /**
   * true のとき、空白の項目で既存の値を消さない。
   * 速報版のように、一部の項目が空白で提供されるデータで使う。
   */
  protected keepExisting = false;

  protected async setup() {
    const result = JrdbData.YYMMDD.exec(this.bridge.basename);
    if (!result) {
      console.log(`ファイル名に日付がありません: ${this.bridge.basename}`);
      return;
    }
    const yy = parseInt(result[1], 10);
    const jrdbBridge = <JrdbBridge>this.bridge;
    jrdbBridge.nen = yy + (70 <= yy ? 1900 : 2000);
    jrdbBridge.gatsu = parseInt(result[2], 10);
    jrdbBridge.nichi = parseInt(result[3], 10);
  }

  protected async teardown() {
    const jrdbBridge = <JrdbBridge>this.bridge;
    delete jrdbBridge.nen;
    delete jrdbBridge.gatsu;
    delete jrdbBridge.nichi;
  }
}
