import { DataToImport } from "../DataToImport";
import { KolLayout } from "./KolLayout";

/**
 * KOL の固定長データを取り込む処理の基底クラス。
 * 取り込み処理は KD3 のアドレスで書き、KD2 の取り込み処理は layout を差し替えます。
 */
export abstract class KolDataToImport extends DataToImport {
  protected layout: KolLayout = KolLayout.kd3;

  /** KD3 のアドレスを、取り込む世代のアドレスにする */
  protected at(kd3Offset: number) {
    return this.layout.at(kd3Offset);
  }

  /** 取り込む世代に、KD3 のアドレスの項目があるか */
  protected has(kd3Offset: number) {
    return this.layout.has(kd3Offset);
  }
}
