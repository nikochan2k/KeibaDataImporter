import {
  Column,
  Entity,
  Index,
  PrimaryGeneratedColumn
} from "typeorm";

@Entity("Kishu")
@Index("IxKishu1", (k: Kishu) => [k.TanshukuKishuMei, k.KishuMei], { unique: true })
@Index("IxKishu2", (k: Kishu) => [k.KishuMei])
export class Kishu {
  @PrimaryGeneratedColumn()
  public Id: number;

  @Column("varchar", { length: 12 })
  public TanshukuKishuMei: string;

  @Column("bigint")
  public FromDate: number;

  @Column("bigint")
  public ToDate: number;

  @Column("varchar", { length: 48, nullable: true })
  public KishuMei?: string;

  @Column("int", { nullable: true })
  public KolKishuCode?: number;

  @Column("int", { nullable: true })
  public JrdbKishuCode?: number;

  @Column("varchar", { length: 72, nullable: true })
  public Furigana?: string;

  @Column("bigint", { nullable: true })
  public Seinengappi?: number;

  @Column("smallint", { nullable: true })
  public HatsuMenkyoNen?: number;
}