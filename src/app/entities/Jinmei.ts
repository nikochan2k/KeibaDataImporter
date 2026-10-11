import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

/** 人名の区分。名前がどの区分かは人によって違うため、KishuMei / ChoukyoushiMei に持つ */
export enum JinmeiKubun {
  Seimei,
  Tanshuku,
  Furigana,
}

/**
 * 人名の辞書。突き合わせ用のキーが同じ名前(異体字・空白の違い)は1行にまとめ、
 * Meishou には最初に取り込んだ表記を残す。
 */
@Entity("Jinmei")
@Index("IxJinmei", (k: Jinmei) => [k.MatchingKey], { unique: true })
export class Jinmei {
  @PrimaryGeneratedColumn()
  public Id: number;

  @Column("varchar", { length: 48 })
  public Meishou: string;

  /** 突き合わせ用のキー (異体字などを揃えたもの) */
  @Column("varchar", { length: 48 })
  public MatchingKey: string;
}
