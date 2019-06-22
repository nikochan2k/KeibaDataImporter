import { DataToImport } from '../DataToImport';
import { JrdbBridge } from './JrdbBridge';
import { Inject } from 'typedi';
import { Bridge } from '../Bridge';

export abstract class JrdbData extends DataToImport {

  private static YYMMDD = /(\d{2})(\d{2})(\d{2})/;

  @Inject()
  protected bridge: Bridge;

  protected setup() {
    const result = JrdbData.YYMMDD.exec(this.bridge.basename);
    if (!result) {
      console.log("ファイル名に日付がありません: " + this.bridge.basename);
      return;
    }
    const yy = parseInt(result[1]);
    const jrdbBridge = <JrdbBridge>this.bridge;
    jrdbBridge.nen = yy + ((70 <= yy) ? 1900 : 2000);
    jrdbBridge.gatsu = parseInt(result[2]);
    jrdbBridge.nichi = parseInt(result[3]);
  }

  protected teardown() {
    const jrdbBridge = <JrdbBridge>this.bridge;
    delete jrdbBridge.nen;
    delete jrdbBridge.gatsu;
    delete jrdbBridge.nichi;
  }

}