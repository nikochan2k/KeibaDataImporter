import { readRaw } from "../../Reader";

/**
 * JV-Data のレコード種別ひとつぶんの取り込み処理。
 * JV-Data はレコード種別を混ぜて 1 つのファイルにするので、JvData がレコード種別 ID で振り分ける。
 */
export abstract class JvdataRecord {
  /** レコード種別 ID (例: "RA") */
  public abstract readonly id: string;

  /** 末尾の CR LF を含むレコード長 */
  public abstract readonly length: number;

  public abstract save(buffer: Buffer): Promise<void>;

  /** データ区分 (レコード種別 ID の次の 1 バイト) */
  protected getKubun(buffer: Buffer) {
    return readRaw(buffer, 2, 1);
  }

  /** 「該当レコード削除」(0) と「レース中止」(9) 以外か */
  protected isActive(buffer: Buffer) {
    const kubun = this.getKubun(buffer);
    return kubun !== "0" && kubun !== "9";
  }
}
