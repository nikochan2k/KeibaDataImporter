import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

export enum MeishouKubun {
  Full,
  Tanshuku,
}

@Entity("Shoyuu")
@Index("IxShoyuu1", (m: Shoyuu) => [m.Meishou], { unique: true })
@Index("IxShoyuu2", (m: Shoyuu) => [m.MatchingKey])
export class Shoyuu {
  @PrimaryGeneratedColumn()
  public Id: number;

  @Column("tinyint")
  public Kubun: MeishouKubun;

  @Column("varchar", { length: 60 })
  public Meishou: string;

  /** 突き合わせ用のキー (空白や異体字などを揃えたもの) */
  @Column("varchar", { length: 60, nullable: true })
  public MatchingKey?: string;

  @Column("tinyint", { nullable: true })
  public BanushiKaiCode: number;
}
