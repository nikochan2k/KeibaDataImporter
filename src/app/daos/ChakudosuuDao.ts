import type { ChakudosuuKikan, ChakudosuuTaishou } from "../converters/Chakudosuu";
import { upsertAll } from "../db/helpers";
import { Chakudosuu } from "../entities/Chakudosuu";
import { ChakudosuuShuukei } from "../entities/ChakudosuuShuukei";
import { readInt } from "../reader/Reader";

/** 着度数の行のキー (分類を除く) */
export interface ChakudosuuKey {
  Taishou: ChakudosuuTaishou;
  TaishouId: number;
  Nengappi: number;
  Kikan: ChakudosuuKikan;
}

/**
 * 1 レコードぶんの着度数を集めて、まとめて保存します。
 * 回数は 1 着・2 着・3 着・4 着以下の 4 つか、1 着〜5 着・6 着以下の 6 つ。
 */
export class ChakudosuuWriter {
  private readonly rows: Chakudosuu[] = [];
  private readonly shuukei: ChakudosuuShuukei[] = [];

  /** 回数を読んで足します (空白は 0)。全部 0 なら行を作りません */
  public add(
    key: ChakudosuuKey,
    bunrui: number,
    buffer: Buffer,
    offset: number,
    width: number,
    count: 4 | 6 = 4,
  ) {
    const c = Array.from(
      { length: count },
      (_, i) => readInt(buffer, offset + i * width, width) ?? 0,
    );
    if (c.every((n) => n === 0)) {
      return;
    }
    this.rows.push(
      count === 6
        ? {
            ...key,
            Bunrui: bunrui,
            Chaku1: c[0],
            Chaku2: c[1],
            Chaku3: c[2],
            Chaku4Ika: c[3] + c[4] + c[5],
            Chaku4: c[3],
            Chaku5: c[4],
            Chakugai: c[5],
          }
        : {
            ...key,
            Bunrui: bunrui,
            Chaku1: c[0],
            Chaku2: c[1],
            Chaku3: c[2],
            Chaku4Ika: c[3],
            Chaku4: null,
            Chaku5: null,
            Chakugai: null,
          },
    );
  }

  public addShuukei(row: Partial<ChakudosuuShuukei> & ChakudosuuKey) {
    this.shuukei.push(row as ChakudosuuShuukei);
  }

  public save() {
    upsertAll(Chakudosuu, this.rows);
    upsertAll(ChakudosuuShuukei, this.shuukei);
  }
}
