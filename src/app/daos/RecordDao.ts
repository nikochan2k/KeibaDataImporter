import { findBy, upsert } from "../db/helpers";
import { Record } from "../entities/Record";
import { RecordHoyuuba } from "../entities/RecordHoyuuba";
import { tool } from "../reader/Tool";

export class RecordDao {
  /**
   * レコードと保持馬を保存して、レコードを返します。
   * 種類・日付・場所・距離・タイムが同じレコードがあれば、そこに足します
   * (同じレコードが、レースごとの出馬表・成績やレコードマスタに何度も出てくるため)。
   * 場所・距離は、どちらかが分からなければ比べません。
   */
  public async saveRecord(toBe: Record, hoyuuba: Omit<RecordHoyuuba, "RecordId">[]) {
    const time = Math.round(toBe.Time * 10);
    const asIs =
      findBy(Record, { Shubetsu: toBe.Shubetsu, Nengappi: toBe.Nengappi }).find(
        (r) =>
          Math.round(r.Time * 10) === time &&
          (r.Basho == null || toBe.Basho == null || r.Basho === toBe.Basho) &&
          (r.Kyori == null || toBe.Kyori == null || r.Kyori === toBe.Kyori),
      ) ?? null;
    const record = await tool.saveOrUpdate(Record, asIs, toBe);
    for (const h of hoyuuba) {
      upsert(RecordHoyuuba, { ...h, RecordId: record.Id });
    }
    return record;
  }
}

export const recordDao = new RecordDao();
