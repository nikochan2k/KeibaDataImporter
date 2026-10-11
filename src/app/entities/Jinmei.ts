import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

export enum JinmeiKubun {
  Seimei,
  Tanshuku,
  Furigana,
}

@Entity("Jinmei")
@Index("IxJinmei2", (k: Jinmei) => [k.MatchingKey])
@Index("IxJinmei", (k: Jinmei) => [k.Meishou], { unique: true })
export class Jinmei {
  @PrimaryGeneratedColumn()
  public Id: number;

  @Column("tinyint")
  public Kubun: JinmeiKubun;

  @Column("varchar", { length: 48 })
  public Meishou: string;

  /** 突き合わせ用のキー (異体字などを揃えたもの) */
  @Column("varchar", { length: 48, nullable: true })
  public MatchingKey?: string;
}
