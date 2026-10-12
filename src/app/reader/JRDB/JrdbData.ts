import { bridge } from "../Bridge";
import { DataToImport } from "../DataToImport";
import { JrdbBridge } from "./JrdbBridge";

export abstract class JrdbData extends DataToImport {
  private static YYMMDD = /(\d{2})(\d{2})(\d{2})/;

  protected async setup() {
    const result = JrdbData.YYMMDD.exec(bridge.basename);
    if (!result) {
      this.logger.warn(`ファイル名に日付がありません: ${bridge.basename}`);
      return;
    }
    const yy = parseInt(result[1], 10);
    const jrdbBridge = <JrdbBridge>bridge;
    jrdbBridge.nen = yy + (70 <= yy ? 1900 : 2000);
    jrdbBridge.gatsu = parseInt(result[2], 10);
    jrdbBridge.nichi = parseInt(result[3], 10);
  }

  protected async teardown() {
    const jrdbBridge = <JrdbBridge>bridge;
    delete jrdbBridge.nen;
    delete jrdbBridge.gatsu;
    delete jrdbBridge.nichi;
  }
}
