import {
  Column,
  Entity,
  Index,
  PrimaryGeneratedColumn
} from "typeorm";

@Entity("Kishu")
@Index("IxKishu1", (k: Kishu) => [k.KolKishuCode], { unique: true })
@Index("IxKishu2", (k: Kishu) => [k.JrdbKishuCode], { unique: true })
@Index("IxKishu4", (k: Kishu) => [k.JvDataKishuCode], { unique: true })
export class Kishu {
  @PrimaryGeneratedColumn()
  public Id: number;

  @Column("mediumint", { nullable: true })
  public KolKishuCode?: number;

  @Column("mediumint", { nullable: true })
  public JrdbKishuCode?: number;

  @Column("varchar", { length: 5, nullable: true })
  public JvDataKishuCode?: string;

  @Column("int", { nullable: true })
  public Seinengappi?: number;

  @Column("tinyint", { nullable: true })
  public Seibetsu?: number;

  @Column("int", { nullable: true })
  public MenkyoKoufuNengappi?: number;

  @Column("int", { nullable: true })
  public MenkyoMasshouNengappi?: number;
}